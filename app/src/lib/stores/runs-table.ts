import type { Writable, Readable } from 'svelte/store';
import type { QueryOptions, AnyMap } from 'briznads-helpers';

import type { Run } from '../../../../pantry/src/lib/model';

import type { ColumnMap, ActiveSort, FilterMap, FiniteFilterValuesMap, AddFilterInfo, StartedFilterValue } from '$lib/types/runs-table';

import { writable, derived, get } from 'svelte/store';
import { get as getValue, Query, smartSort, smartSortFunction, objectEntries } from 'briznads-helpers';


class RunsTable {
	public isInitialized : boolean = false;

	public columnMap       : Writable<ColumnMap>;
	public unmodifiedRuns  : Writable<Run[]>;
	public selectedColumns : Writable<string[]>;
	public filterMap       : Writable<FilterMap>;
	public activeSearch    : Writable<string>;
	public activeSort      : Writable<ActiveSort>;
	public addFilterInfo   : Writable<AddFilterInfo>;

	public selectableColumns     : Readable<string[]>;
	public visibleColumns        : Readable<string[]>;
	public filteredRuns          : Readable<Run[]>;
	public queriedRuns           : Readable<Run[]>;
	public runs                  : Readable<Run[]>;
	public finiteFilterValuesMap : Readable<FiniteFilterValuesMap>;
	public filterableColumns     : Readable<string[]>;


	constructor() {
		// set writeable stores with init values
		this.columnMap       = writable({});
		this.unmodifiedRuns  = writable([]);
		this.selectedColumns = writable([]);
		this.filterMap       = writable({
			started : [ 'last 30 days' ],
		});
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
		this.filteredRuns          = this.initFilteredRuns();
		this.queriedRuns           = this.initQueriedRuns();
		this.runs                  = this.initRuns();
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
		);
	}

	private initFilteredRuns() : Readable<Run[]> {
		return derived(
			[
				this.unmodifiedRuns,
				this.filterMap,
			],
			([
				$unmodifiedRuns,
				$filterMap,
			]) : Run[] => this.filterRuns($unmodifiedRuns ?? [], $filterMap),
		);
	}

	private filterRuns(runs : Run[], filterMap : FilterMap) : Run[] {
		const finiteFilterValuesMap = get(this.finiteFilterValuesMap);

		for (const [ key, values ] of objectEntries(filterMap)) {
			if (key === 'machineTime' || key === 'started') {
				runs = this.filterNumericalRange(runs, key, values as [ number, number ]);

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

			const queryResultsMap : { [ key in string ] : Run } = {};

			for (const value of values ?? []) {
				const queryResults = Query.matchObject(
					runs,
					value,
					typeof key === 'number' ? key.toString() : key,
					queryOptions,
				);

				for (const run of queryResults) {
					queryResultsMap[ run.id ] = run;
				}
			}

			runs = Object.values(queryResultsMap);
		}

		return runs;
	}

	private filterNumericalRange(runs : Run[], key : 'machineTime' | 'started', values : [ number, number ]) : Run[] {
		let [ lower, upper ] = values;

		if (key === 'started' && typeof lower === 'string') {
			[ lower, upper ] = this.parseStartedValues(lower);
		}

		return runs.filter((run : Run) => {
			const numericalValue : number = getValue(run, key.split('.'));

			const withinLowerBound = lower == null || numericalValue >= lower;
			const withinUpperBound = upper == null || numericalValue <= upper;

			return withinLowerBound && withinUpperBound;
		});
	}

	private parseStartedValues(value : StartedFilterValue) : [ number, number ] {
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

	private initQueriedRuns() : Readable<Run[]> {
		return derived(
			[
				this.filteredRuns,
				this.selectedColumns,
				this.activeSearch,
			],
			([
				$filteredRuns,
				$selectedColumns,
				$activeSearch,
			]) : Run[] => this.searchRuns($filteredRuns, $activeSearch, $selectedColumns),
		);
	}

	private searchRuns(runs : Run[], search : string, selectedColumns : string[]) : Run[] {
		if (!this.isInitialized) {
			return [];
		}

		return Query.matchObject(
			runs,
			search,
			selectedColumns,
			{
				matchPartialWords   : true,
				disregardQueryOrder : true,
				caseInsensitive     : true,
			},
		);
	}

	private initRuns() : Readable<Run[]> {
		return derived(
			[
				this.queriedRuns,
				this.activeSort,
			],
			([
				$queriedRuns,
				$activeSort,
			]) : Run[] => smartSort($queriedRuns, $activeSort.direction, false, $activeSort.key),
		);
	}

	private initFiniteFilterValuesMap() : Readable<FiniteFilterValuesMap> {
		return derived(
			[
				this.runs,
			],
			([
				$runs,
			]) : FiniteFilterValuesMap => {
				return objectEntries(get(this.columnMap) ?? {})
					.reduce((sum : FiniteFilterValuesMap, [ key, column ]) => {
						if (column.unfilterable === true) {
							return sum;
						}

						sum[ key ] = this.parseFiniteFilterValues($runs, key);

						return sum;
					}, {});
			},
		);
	}

	private parseFiniteFilterValues(runs : Run[], key : string) : false | any[] {
		if (key === 'machineTime' || key === 'started') {
			return [];
		}

		let finiteValuesMap : AnyMap = {};

		for (const run of runs) {
			const value = getValue(run, key.split('.'));

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
		);
	}

	public init(columnMap : ColumnMap, unmodifiedRuns : Run[]) : void {
		if (this.isInitialized) {
			console.error('RunsTable already initialized');
		}

		this.columnMap.set(columnMap);
		this.unmodifiedRuns.set(unmodifiedRuns);

		this.initColumns();

		this.isInitialized = true;
	}

	private initColumns() : void {
		const selectedColumns = objectEntries(get(this.columnMap))
			.filter(([ key, column ]) =>
				column.unhideable === true || column.initiallyHidden !== true
			)
			.map(([ key ]) => key);

		this.selectedColumns.set(selectedColumns);
	}

	public initStoredColumns(storedColumnsStr : string | null) : void {
		if (!(this.isInitialized && storedColumnsStr)) {
			return;
		}

		const storedColumns = JSON.parse(storedColumnsStr || '[]');

		const selectableColumns = get(this.selectableColumns);

		const visibleColumns = storedColumns
			.filter((key : string) => selectableColumns.includes(key))

		this.selectedColumns.set(visibleColumns);
	}

	public updateFilterMap(key : string | FilterMap, values? : any[]) : void {
		this.filterMap.update(item => {
			if (typeof key === 'object') {
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

export const runsTable = new RunsTable();
