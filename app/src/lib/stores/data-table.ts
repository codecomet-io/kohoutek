import type { Writable, Readable } from 'svelte/store';
import type { QueryOptions, AnyMap } from 'briznads-helpers';

import type { ColumnMap, ActiveSort, FilterMap, FiniteFilterValuesMap, AddFilterInfo, TimeFilterNamedValue, Row, Options } from '$lib/types/data-table';

import { writable, derived, get } from 'svelte/store';
import { get as getValue, Query, smartSort, smartSortFunction, objectEntries } from 'briznads-helpers';


type PartialOptions = Partial<Options>;


export class DataTable {
	private readonly defaultOpts : PartialOptions = {
		parseRowLink          : () => '',
		parseCellTitle        : (_, value : any) => value.toString(),
		defaultTimeFilter     : [ 'last 30 days' ],
		includeAggregatedData : true,
	};

	public opts!         : Options;
	public isInitialized : boolean = false;

	public columnMap       : Writable<ColumnMap>;
	public initialRows     : Writable<Row[]>;
	public selectedColumns : Writable<string[]>;
	public filterMap       : Writable<FilterMap>;
	public activeSearch    : Writable<string>;
	public activeSort      : Writable<ActiveSort>;
	public addFilterInfo   : Writable<AddFilterInfo>;

	public selectableColumns     : Readable<string[]>;
	public visibleColumns        : Readable<string[]>;
	public filteredRows          : Readable<Row[]>;
	public queriedRows           : Readable<Row[]>;
	public rows                  : Readable<Row[]>;
	public finiteFilterValuesMap : Readable<FiniteFilterValuesMap>;
	public filterableColumns     : Readable<string[]>;


	constructor() {
		// set writeable stores with init values
		this.columnMap       = writable({});
		this.initialRows     = writable([]);
		this.selectedColumns = writable([]);
		this.filterMap       = writable({});
		this.activeSearch    = writable('');
		this.activeSort      = writable({
			key       : 'started',
			direction : 'descending',
		});
		this.addFilterInfo   = writable({
			key          : '',
			finiteValues : false,
		});

		// setup derived stores
		this.selectableColumns     = this.initSelectableColumns();
		this.visibleColumns        = this.initVisibleColumns();
		this.filteredRows          = this.initFilteredRows();
		this.queriedRows           = this.initQueriedRows();
		this.rows                  = this.initRows();
		this.finiteFilterValuesMap = this.initFiniteFilterValuesMap();
		this.filterableColumns     = this.initFilterableColumns();
	}


	private initSelectableColumns() : Readable<string[]> {
		return derived(
			[
				this.columnMap,
			],
			([
				$columnMap,
			]) : string[] => {
				return objectEntries($columnMap ?? {})
					.filter(([ key, column ]) => column.unhideable !== true)
					.map(([ key ]) => key);
			},
			[],
		);
	}

	private initVisibleColumns() : Readable<string[]> {
		return derived(
			[
				this.selectableColumns,
				this.selectedColumns,
			],
			([
				$selectableColumns,
				$selectedColumns,
			]) : string[] => {
				return objectEntries(get(this.columnMap) ?? {})
					.filter(([ key, column ]) => {
						if (column.unhideable === true) {
							return true;
						}

						return $selectableColumns.includes(key) && $selectedColumns.includes(key);
					})
					.map(([ key ]) => key);
			},
			[],
		);
	}

	private initFilteredRows() : Readable<Row[]> {
		return derived(
			[
				this.initialRows,
				this.filterMap,
			],
			([
				$initialRows,
				$filterMap,
			]) : Row[] => this.filterRows($initialRows ?? [], $filterMap),
			[],
		);
	}

	private filterRows(rows : Row[], filterMap : FilterMap) : Row[] {
		const finiteFilterValuesMap = get(this.finiteFilterValuesMap);

		for (const [ key, values ] of objectEntries(filterMap)) {
			if (key === 'machineTime' || key === 'started') {
				rows = this.filterNumericalRange(rows, key, values as [ number, number ]);

				continue;
			}

			const queryOptions : QueryOptions = finiteFilterValuesMap[ key ]
				? {
					matchPartialWords   : false,
					disregardQueryOrder : false,
					caseInsensitive     : false,
				}
				: {
					matchPartialWords   : true,
					disregardQueryOrder : true,
					caseInsensitive     : true,
				};

			const queryResultsMap : { [ key in string ] : Row } = {};

			for (const value of values ?? []) {
				const queryResults = Query.matchObject(
					rows,
					value,
					typeof key === 'number' ? key.toString() : key,
					queryOptions,
				);

				for (const row of queryResults) {
					queryResultsMap[ row.id ] = row;
				}
			}

			rows = Object.values(queryResultsMap);
		}

		return rows;
	}

	private filterNumericalRange(rows : Row[], key : 'machineTime' | 'started', values : [ number, number ]) : Row[] {
		let [ lower, upper ] = values;

		if (key === 'started' && typeof lower === 'string') {
			[ lower, upper ] = this.parseStartedValues(lower);
		}

		return rows.filter((row : Row) => {
			const numericalValue : number = getValue(row, key.split('.'));

			const withinLowerBound = lower == null || numericalValue >= lower;
			const withinUpperBound = upper == null || numericalValue <= upper;

			return withinLowerBound && withinUpperBound;
		});
	}

	private parseStartedValues(value : TimeFilterNamedValue) : [ number, number ] {
		let numericValue : number = parseInt(value.replace(/[^0-9]/g, ''), 10);

		if (isNaN(numericValue)) {
			return [ 0, 0 ];
		} else if (numericValue !== 24) {
			numericValue *= 24;
		}

		numericValue *= 60 * 60 * 1000;

		const now : number = Date.now();

		return [ now - numericValue, now ];
	}

	private initQueriedRows() : Readable<Row[]> {
		return derived(
			[
				this.filteredRows,
				this.activeSearch,
			],
			([
				$filteredRows,
				$activeSearch,
			]) : Row[] => this.searchRows($filteredRows, $activeSearch, get(this.selectedColumns)),
			[],
		);
	}

	private searchRows(rows : Row[], search : string, selectedColumns : string[]) : Row[] {
		return Query.matchObject(
			rows,
			search,
			selectedColumns,
			{
				matchPartialWords   : true,
				disregardQueryOrder : true,
				caseInsensitive     : true,
			},
		);
	}

	private initRows() : Readable<Row[]> {
		return derived(
			[
				this.queriedRows,
				this.activeSort,
			],
			([
				$queriedRows,
				$activeSort,
			]) : Row[] => smartSort($queriedRows, $activeSort.direction, false, $activeSort.key),
			[],
		);
	}

	private initFiniteFilterValuesMap() : Readable<FiniteFilterValuesMap> {
		return derived(
			[
				this.rows,
			],
			([
				$rows,
			]) : FiniteFilterValuesMap => {
				return objectEntries(get(this.columnMap) ?? {})
					.reduce((sum : FiniteFilterValuesMap, [ key, column ]) => {
						if (column.unfilterable === true) {
							return sum;
						}

						sum[ key ] = this.parseFiniteFilterValues($rows, key);

						return sum;
					}, {});
			},
			{},
		);
	}

	private parseFiniteFilterValues(rows : Row[], key : string) : false | any[] {
		if (key === 'machineTime' || key === 'started') {
			return [];
		}

		let finiteValuesMap : AnyMap = {};

		for (const row of rows) {
			const value = getValue(row, key.split('.'));

			if (value == undefined) {
				continue;
			}

			const valueStr = value.toString();

			finiteValuesMap[ valueStr ] = value;

			if (Object.keys(finiteValuesMap).length > 10) {
				finiteValuesMap = {};

				break;
			}
		}

		let finiteValues : false | string[] = Object.values(finiteValuesMap);

		if (finiteValues.length === 0) {
			finiteValues = false;
		}

		if (finiteValues) {
			finiteValues.sort(smartSortFunction);
		}

		return finiteValues;
	}

	private initFilterableColumns() : Readable<string[]> {
		return derived(
			[
				this.selectedColumns,
				this.finiteFilterValuesMap,
			],
			([
				$selectedColumns,
				$finiteFilterValuesMap,
			]) : string[] => {
				return objectEntries(get(this.columnMap) ?? {})
					.filter(([ key, column ]) => {
						return column.unfilterable !== true
							&& $finiteFilterValuesMap[ key ]
							&& (
								$selectedColumns.includes(key)
								|| column.unhideable === true
							);
					})
					.map(([ key ]) => key);
			},
			[],
		);
	}

	public init(options : Options) : void {
		if (this.isInitialized) {
			console.error('DataTable already initialized');
		}

		this.opts = this.parseOptions(options);

		this.initFilters();

		this.initColumns();

		this.initialRows.set(options.initialRows);

		this.isInitialized = true;
	}

	public parseOptions(options : Options) : Options {
		return {
			...this.defaultOpts,
			...options,
		};
	}

	private initFilters() : void {
		if (this.opts.defaultTimeFilter) {
			this.updateFilterMap('started', this.opts.defaultTimeFilter);
		}
	}

	private initColumns() : void {
		this.columnMap.set(this.opts.columnMap);

		const selectedColumns = objectEntries(get(this.columnMap))
			.filter(([ key, column ]) =>
				column.unhideable === true || column.initiallyHidden !== true
			)
			.map(([ key ]) => key);

		this.selectedColumns.set(selectedColumns);
	}

	public initStoredColumns(storedColumnsStr : string | null) : void {
		if (!storedColumnsStr) {
			return;
		}

		const storedColumns = JSON.parse(storedColumnsStr || '[]');

		const selectableColumns = get(this.selectableColumns);

		const selectedColumns = storedColumns
			.filter((key : string) => selectableColumns.includes(key))

		this.selectedColumns.set(selectedColumns);
	}

	public updateFilterMap(key : string | FilterMap, values? : any[]) : void {
		this.filterMap.update(item => {
			if (typeof key === 'object') {
				if (this.opts.defaultTimeFilter && !key.started) {
					key.started = this.opts.defaultTimeFilter;
				}

				return key;
			}

			if (values == null) {
				delete item[ key ];
			} else {
				item[ key ] = values;
			}

			return item;
		});
	}

	public updateActiveSort(key : string = 'started', direction : 'ascending' | 'descending' = 'descending') : void {
		this.activeSort.set({
			key,
			direction,
		});
	}
}
