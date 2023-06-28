import type { Writable, Readable } from 'svelte/store';
import type { QueryOptions, AnyMap, NumberMap } from 'briznads-helpers';

import type { ColumnMap, ActiveSort, FilterMap, FiniteFilterValuesMap, AddFilterInfo, TimeFilterValue, TimeFilterNamedValue, Row, Options, PartialOptions, AggregatedColumnDataMap, AggregatedColumnData, ParseDisplayValueFunction } from '$types/data-table';
import type { AggregatedHeadlineDataMap, TrendDataMap } from '$types/aggregated-headline-data';

import { writable, derived, get } from 'svelte/store';
import { get as getValue, Query, smartSort, smartSortFunction, objectEntries, sleep, deepCopy, roundToDecimals } from 'briznads-helpers';


export class DataTable {
	private readonly defaultOpts : PartialOptions = {
		parseRowLink   : () => '',
		parseCellTitle : (_, value : any) => value.toString(),
	};

	private defaultAggregatedHeadlineDataMap! : AggregatedHeadlineDataMap;

	public opts!                               : Options;
	public isInitialized                       : boolean = false;
	public updateAggregatedHeadlineValues      : boolean = false;
	public updateAggregatedColumnValues        : boolean = false;
	public updateTrendValues                   : boolean = false;

	public columnMap       : Writable<ColumnMap>;
	public initialRows     : Writable<Row[]>;
	public selectedColumns : Writable<string[]>;
	public filterMap       : Writable<FilterMap>;
	public activeSearch    : Writable<string>;
	public activeSort      : Writable<ActiveSort>;
	public addFilterInfo   : Writable<AddFilterInfo>;

	public selectableColumns         : Readable<string[]>;
	public visibleColumns            : Readable<string[]>;
	private filteredQueriedRows      : Readable<Row[]>;
	public rows                      : Readable<Row[]>;
	public finiteFilterValuesMap     : Readable<FiniteFilterValuesMap>;
	public filterableColumns         : Readable<string[]>;
	public selectableFilters         : Readable<string[]>;
	public aggregatedHeadlineDataMap : Readable<AggregatedHeadlineDataMap>;
	public aggregatedColumnDataMap   : Readable<AggregatedColumnDataMap>;
	private trendRows                : Readable<Row[]>;
	public trendDataMap              : Readable<TrendDataMap>;


	constructor() {
		// set writeable stores with init values
		this.columnMap       = writable({});
		this.initialRows     = writable([]);
		this.selectedColumns = writable([]);
		this.filterMap       = writable({});
		this.activeSearch    = writable('');
		this.activeSort      = writable({
			key       : '',
			direction : 'ascending',
		});
		this.addFilterInfo   = writable({
			key          : '',
			finiteValues : false,
		});

		// setup derived stores
		this.selectableColumns         = this.initSelectableColumns();
		this.visibleColumns            = this.initVisibleColumns();
		this.filteredQueriedRows       = this.initFilteredQueriedRows();
		this.rows                      = this.initRows();
		this.finiteFilterValuesMap     = this.initFiniteFilterValuesMap();
		this.filterableColumns         = this.initFilterableColumns();
		this.selectableFilters         = this.initSelectableFilters();
		this.aggregatedHeadlineDataMap = this.initAggregatedHeadlineDataMap();
		this.aggregatedColumnDataMap   = this.initAggregatedColumnDataMap();
		this.trendRows                 = this.initTrendRows();
		this.trendDataMap              = this.initTrendDataMap();
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
				return objectEntries(this.opts?.columnMap ?? {})
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

	private initFilteredQueriedRows() : Readable<Row[]> {
		return derived(
			[
				this.initialRows,
				this.filterMap,
				this.activeSearch,
			],
			([
				$initialRows,
				$filterMap,
				$activeSearch,
			]) : Row[] => {
				const filteredRows = this.filterRows($initialRows ?? [], $filterMap);

				const filteredQueriedRows = this.searchRows(filteredRows, $activeSearch);

				return filteredQueriedRows;
			},
			[],
		);
	}

	private filterRows(rows : Row[], filterMap : FilterMap) : Row[] {
		const finiteFilterValuesMap = get(this.finiteFilterValuesMap);

		for (const [ key, values ] of objectEntries(filterMap)) {
			rows = this.opts?.columnMap[ key ]?.type === 'string'
				? this.filterStringValue(rows, key as string, values as string[], finiteFilterValuesMap[ key ])
				: this.filterNumericalRangeValue(rows, key as string, values as [ number, number ]);
		}

		return rows;
	}

	private filterStringValue(rows : Row[], key : string, values : string[], finiteValues : false | string[]) : Row[] {
		const queryOptions : QueryOptions = finiteValues
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
				key,
				queryOptions,
			);

			for (const row of queryResults) {
				queryResultsMap[ row.id ] = row;
			}
		}

		return Object.values(queryResultsMap);
	}

	private filterNumericalRangeValue(rows : Row[], key : string, values : [ number, number ]) : Row[] {
		let [ lower, upper ] = values;

		if (upper == null && typeof lower === 'string') {
			[ lower, upper ] = this.parseNamedTimeFilterValues(lower);
		}

		return rows.filter((row : Row) => {
			const numericalValue : number = getValue(row, key.split('.'));

			const withinLowerBound = lower == null || numericalValue >= lower;
			const withinUpperBound = upper == null || numericalValue <= upper;

			return withinLowerBound && withinUpperBound;
		});
	}

	public parseNamedTimeFilterValues(value : TimeFilterNamedValue) : [ number, number ] {
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

	private searchRows(rows : Row[], search? : string) : Row[] {
		return Query.matchObject(
			rows,
			search ?? get(this.activeSearch),
			get(this.selectedColumns),
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
				this.filteredQueriedRows,
				this.activeSort,
			],
			([
				$filteredQueriedRows,
				$activeSort,
			]) : Row[] => smartSort($filteredQueriedRows, $activeSort.direction, false, $activeSort.key),
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
				return objectEntries(this.opts?.columnMap ?? {})
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
		if (this.opts?.columnMap?.[ key ]?.type !== 'string') {
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
				return objectEntries(this.opts?.columnMap ?? {})
					.filter(([ key, column ]) => {
						return column.unfilterable !== true
							&& $finiteFilterValuesMap[ key ]
							&& (
								$selectedColumns.includes(key)
								|| column.unhideable === true
								|| key === this.opts?.defaultTimeFilter?.key
							);
					})
					.map(([ key ]) => key);
			},
			[],
		);
	}

	private initSelectableFilters() : Readable<string[]> {
		return derived(
			[
				this.filterableColumns,
			],
			([
				$filterableColumns,
			]) : string[] => {
				return $filterableColumns
					.filter((key : string) => key !== this.opts?.defaultTimeFilter?.key);
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

		this.updateActiveSort();

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
			this.updateFilterMap(this.opts.defaultTimeFilter.key, this.opts.defaultTimeFilter.value);
		}
	}

	private initColumns() : void {
		const selectedColumns = objectEntries(this.opts.columnMap)
			.filter(([ key, column ]) =>
				column.unhideable === true || column.initiallyHidden !== true
			)
			.map(([ key ]) => key);

		this.columnMap.set(this.opts.columnMap);

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
				if (this.opts.defaultTimeFilter && !key[ this.opts.defaultTimeFilter.key ]) {
					key[ this.opts.defaultTimeFilter.key ] = this.opts.defaultTimeFilter.value;
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

	public updateActiveSort(key? : string, direction? : 'ascending' | 'descending') : void {
		if (key == null && this.opts?.defaultSort) {
			key = this.opts.defaultSort.key;
		}

		if (key == null) {
			return;
		}

		if (direction == null) {
			direction = this.opts?.defaultSort?.direction ?? 'ascending';
		}

		this.activeSort.set({
			key,
			direction,
		});
	}

	private initAggregatedHeadlineDataMap() : Readable<AggregatedHeadlineDataMap> {
		return derived(
			this.filteredQueriedRows,
			(
				$rows : Row[],
				set   : (value : any) => void,
			) : void => {
				if (this.opts.aggregatedHeadlineDataOptionsMap && $rows?.length > 0) {
					this.updateAggregatedHeadlineValues = true;

					this.setAggregatedHeadlineDataMap($rows, set);
				} else {
					this.updateAggregatedHeadlineValues = false;

					set(this.getDefaultAggregatedHeadlineDataMap());
				}
			},
			this.getDefaultAggregatedHeadlineDataMap(),
		);
	}

	private async setAggregatedHeadlineDataMap(rows : Row[], set : (value : any) => void) : Promise<void> {
		await sleep(1);

		const map : AggregatedHeadlineDataMap = {};

		for (const [ key, value ] of objectEntries(this.opts.aggregatedHeadlineDataOptionsMap ?? {})) {
			const values = this.updateAggregatedHeadlineValues
				? await value.parse(rows)
				: undefined;

			map[ key ] = {
				...this.getDefaultAggregatedHeadlineDataMap()[ key ],
				...(this.updateAggregatedHeadlineValues
					? values
					: undefined
				),
			};

			set(map);
		}
	}

	private getDefaultAggregatedHeadlineDataMap() : AggregatedHeadlineDataMap {
		if (!this.isInitialized) {
			return {};
		} else if (this.defaultAggregatedHeadlineDataMap == null) {
			const map : AggregatedHeadlineDataMap = {};

			for (const [ key, value ] of objectEntries(this.opts.aggregatedHeadlineDataOptionsMap ?? {})) {
				map[ key ] = {
					titleLabel    : value.titleLabel,
					chartLabel    : value.chartLabel,
					formatXValue  : value.formatXValue,
					formatYValue  : value.formatYValue,
					xValueType    : value.xValueType,
					hideXTicks    : value.hideXTicks,
					hideYTicks    : value.hideYTicks,
					showTooltips  : value.showTooltips,
					timeFilterKey : value.timeFilterKey,
				};
			}

			this.defaultAggregatedHeadlineDataMap = map;
		}

		return this.defaultAggregatedHeadlineDataMap;
	}

	private initAggregatedColumnDataMap() : Readable<AggregatedColumnDataMap> {
		return derived(
			[
				this.filteredQueriedRows,
				this.visibleColumns,
			],
			(
				[
					$rows,
					$visibleColumns,
				],
				set : (value : any) => void,
			) : void => {
				const activeColumns : string[] = this.parseActiveAggregatedColumns($visibleColumns);

				if (activeColumns.length > 0 && $rows?.length > 0) {
					this.updateAggregatedColumnValues = true;

					this.setAggregatedColumnDataMap(activeColumns, $rows, set);
				} else {
					this.updateAggregatedColumnValues = false;

					set({});
				}
			},
			{},
		);
	}

	private parseActiveAggregatedColumns(visibleColumns : string[]) : string[] {
		return objectEntries(this.opts?.columnMap ?? {})
			.filter(([ key, value ]) => value.aggregatedColumnDataDirection)
			.map(([ key ]) => key)
			.filter((key : string) => visibleColumns.includes(key));
	}

	private async setAggregatedColumnDataMap(activeColumns : string[], rows : Row[], set : (value : any) => void) : Promise<void> {
		await sleep(1);

		const map : AggregatedColumnDataMap = {};

		for (const key of activeColumns) {
			if (this.updateAggregatedColumnValues) {
				map[ key ] = this.parseAggregatedColumnData(key, rows);
			}

			set(map);
		}
	}

	private parseAggregatedColumnData(key : string, rows : Row[]) : AggregatedColumnData {
		const sortArr = rows.map(item => getValue(item, key.split('.')));

		const rangeArr = smartSort(sortArr, this.opts?.columnMap[ key ]?.aggregatedColumnDataDirection);

		const best = rangeArr[ 0 ];
		const worst = rangeArr[ rangeArr.length - 1 ];

		return {
			best,
			worst,
		};
	}

	private initTrendRows() : Readable<Row[]> {
		return derived(
			[
				this.initialRows,
				this.aggregatedHeadlineDataMap,
			],
			(
				[
					$initialRows,
					$aggregatedHeadlineDataMap,
				],
				set : (value : any) => void,
			) : void => {
				const filterMap = get(this.filterMap);
				const trendDataMap = this.getTrendDataMap($aggregatedHeadlineDataMap);

				if (filterMap[ this.opts?.defaultTimeFilter?.key as string ] && Object.keys(trendDataMap).length > 0) {
					this.updateTrendValues = true;

					this.setTrendRows($initialRows, filterMap, set);
				} else {
					this.updateTrendValues = false;

					set([]);
				}
			},
			[],
		);
	}

	private getTrendDataMap(aggregatedHeadlineDataMap : AggregatedHeadlineDataMap) : TrendDataMap {
		const aggregatedHeadlineValueMap = this.getAggregatedHeadlineValueMap(aggregatedHeadlineDataMap);

		const entries = objectEntries(this.opts?.aggregatedHeadlineDataOptionsMap ?? {})
			.filter(([ key, value ]) => value.trendDataDirection != null && key in aggregatedHeadlineValueMap)
			.map(([ key, value ]) => [
				key,
				{
					currentValue : aggregatedHeadlineValueMap[ key ],
					direction    : value.trendDataDirection,
				},
			]);

		return Object.fromEntries(entries);
	}

	private getAggregatedHeadlineValueMap(aggregatedHeadlineDataMap : AggregatedHeadlineDataMap) : NumberMap {
		const entries : [ string, number ][] = objectEntries(aggregatedHeadlineDataMap)
			.filter(([ key, value ]) => value.aggregatedValue != null)
			.map(([ key, value ]) => [ key, value.aggregatedValue as number ]);

		return Object.fromEntries(entries);
	}

	private async setTrendRows(rows : Row[], filterMap : FilterMap, set : (value : any) => void) : Promise<void> {
		sleep(10);

		if (!this.updateTrendValues) {
			return;
		}

		const trendFilters = this.parseTrendFilters(filterMap);

		if (!trendFilters) {
			return;
		}

		const filteredRows = this.filterRows(rows ?? [], trendFilters);

		const filteredQueriedRows = this.searchRows(filteredRows);

		set(filteredQueriedRows);
	}

	private parseTrendFilters(currentFilterMap : FilterMap) : void | FilterMap {
		const timeKey = this.opts?.defaultTimeFilter?.key;

		if (!timeKey)	{
			return;
		}

		const filterMap = deepCopy(currentFilterMap);

		const [ currentLower, currentUpper ] = filterMap[ timeKey ] as TimeFilterValue ?? [];

		let numericalLower : number;
		let numericalUpper : number;

		if (currentUpper == null) {
			if (typeof currentLower === 'string') {
				[ numericalLower, numericalUpper ] = this.parseNamedTimeFilterValues(currentLower);
			} else {
				return;
			}
		} else {
			[ numericalLower, numericalUpper ] = [ currentLower as number, currentUpper ];
		}

		const timeRange = numericalUpper - numericalLower;

		filterMap[ timeKey ] = [ numericalLower - timeRange, numericalLower ];

		return filterMap;
	}

	private initTrendDataMap() : Readable<TrendDataMap> {
		return derived(
			[
				this.aggregatedHeadlineDataMap,
				this.trendRows,
			],
			(
				[
					$aggregatedHeadlineDataMap,
					$trendRows,
				],
				set : (value : any) => void,
			) : void => {
				const trendDataMap = this.getTrendDataMap($aggregatedHeadlineDataMap);

				if ($trendRows.length > 0 && Object.keys(trendDataMap).length > 0) {
					this.updateTrendValues = true;

					this.setTrendDataMap($trendRows, trendDataMap, set);
				} else {
					this.updateTrendValues = false;

					set({});
				}
			},
			{},
		);
	}

	private async setTrendDataMap(rows : Row[], trendDataMap : TrendDataMap, set : (value : any) => void) : Promise<void> {
		await sleep(10);

		if (!this.updateTrendValues) {
			return;
		}

		const map : TrendDataMap = {};

		for (const [ key, value ] of objectEntries(trendDataMap)) {
			const parse = this.opts.aggregatedHeadlineDataOptionsMap?.[ key ]?.parse;

			if (!parse) {
				continue;
			}

			const { aggregatedValue, title } = await parse(rows);

			if (aggregatedValue == null || isNaN(aggregatedValue)) {
				continue;
			}

			const previousValue : number = aggregatedValue;

			let changePercent : number = value.currentValue / previousValue * 100 - 100;

			if (isNaN(changePercent)) {
				continue;
			}

			changePercent = roundToDecimals(changePercent);

			map[ key ] = {
				...value,
				previousValue,
				changePercent,
				previousTitle : title,
			};

			set(map);
		}
	}

	public parseDisplayValue(key : string, value : any, index? : number) : string {
		return this.getDisplayValueFunction(key)(value, index);
	}

	public getDisplayValueFunction(key : string) : ParseDisplayValueFunction {
		return this.opts?.columnMap?.[ key ]?.parseDisplayValue ?? ((value : any) => value?.toString() ?? '');
	}
}
