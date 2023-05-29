import type { Writable, Readable } from 'svelte/store';
import type { QueryOptions, AnyMap } from 'briznads-helpers';

import type { Run } from '../../../../pantry/src/lib/model';

import type { ColumnMap, ActiveSort, FilterMap, FiniteFilterValuesMap, AggregatedDataMap, AggregatedData, AddFilterInfo } from '$lib/types/runs-table';

import { writable, derived, get } from 'svelte/store';
import { get as getValue, Query, lapsed, smartSort, smartSortFunction, roundToDecimals } from 'briznads-helpers';

import { objectEntries, getEndpoints } from '$lib/helper';


class RunsTable {
	public isInitialized : boolean = false;

	public columnMap       : Writable<ColumnMap>;
	public unmodifiedRuns  : Writable<Run[]>;
	public selectedColumns : Writable<string[]>;
	public filterMap       : Writable<FilterMap>;
	public activeSort      : Writable<ActiveSort>;
	public addFilterInfo   : Writable<AddFilterInfo>;

	public selectableColumns     : Readable<string[]>;
	public visibleColumns        : Readable<string[]>;
	public runs                  : Readable<Run[]>;
	public finiteFilterValuesMap : Readable<FiniteFilterValuesMap>;
	public aggregatedDataMap     : Readable<AggregatedDataMap>;
	public filterableColumns     : Readable<string[]>;


	constructor() {
		// set the writeable stores with init values
		this.columnMap       = writable({});
		this.unmodifiedRuns  = writable([]);
		this.selectedColumns = writable([]);
		this.filterMap       = writable({});
		this.activeSort      = writable({
			key       : 'started',
			direction : 'descending',
		});
		this.addFilterInfo   = writable({
			key          : '',
			finiteValues : false,
		});

		// setup the derived stores
		this.selectableColumns     = this.initSelectableColumns();
		this.visibleColumns        = this.initVisibleColumns();
		this.runs                  = this.initRuns();
		this.finiteFilterValuesMap = this.initFiniteFilterValuesMap();
		this.aggregatedDataMap     = this.initAggregatedDataMap();
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

	private initRuns() : Readable<Run[]> {
		return derived(
			[
				this.unmodifiedRuns,
				this.activeSort,
				this.filterMap,
			],
			([
				$unmodifiedRuns,
				$activeSort,
				$filterMap,
			]) : Run[] => {
				let runs = this.filterRuns($unmodifiedRuns ?? [], $filterMap);

				runs = smartSort(runs, $activeSort.direction, true, $activeSort.key);

				return runs;
			},
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
					key,
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
		const [ lower, upper ] = values;

		return runs.filter((run : Run) => {
			const numericalValue : number = getValue(run, key.split('.'));

			const withinLowerBound = lower == null || numericalValue >= lower;
			const withinUpperBound = upper == null || numericalValue <= upper;

			return withinLowerBound && withinUpperBound;
		});
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

	private initAggregatedDataMap() : Readable<AggregatedDataMap> {
		return derived(
			[
				this.runs,
			],
			([
				$runs,
			]) : AggregatedDataMap => {
				return {
					avgMachineTime : this.parseAvgMachineTime($runs),
					avgRunsPerDay  : this.parseAvgRunsPerDay($runs),
					errorRate      : this.parseErrorRate($runs),
					avgCachedRate  : this.parseAvgCachedRate($runs),
				};
			},
		);
	}

	private parseAvgMachineTime(runs : Run[]) : AggregatedData {
		const name = 'Average Duration';

		const chartCoordinates = runs.map((run : Run) => ({
			x : run.started,
			y : run.machineTime,
		}));

		const totalMachineTime = chartCoordinates.reduce((sum, data) => sum + data.y, 0);

		const value = lapsed(Math.floor(totalMachineTime / chartCoordinates.length), true);

		return {
			name,
			value,
			chartCoordinates,
		};
	}

	private parseAvgRunsPerDay(runs : Run[]) : AggregatedData {
		const name = 'Average Runs Per Day';

		const { lower, upper } = getEndpoints(runs, 'started', true);

		// calculate the time difference of two dates
    const difference = upper - lower;

		// calculate the no. of days between two dates
		const differenceInDays = difference / (1000 * 3600 * 24);

		const value = roundToDecimals(runs.length / differenceInDays);

		return {
			name,
			value,
		};
	}

	private parseErrorRate(runs : Run[]) : AggregatedData {
		const name = 'Error Rate';

		const erroredRuns : number = runs
			.filter((run : Run) => run.status === 'errored')
			.length;

		const value = `${ roundToDecimals(erroredRuns / runs.length * 100) }%`;

		return {
			name,
			value,
		};
	}

	private parseAvgCachedRate(runs : Run[]) : AggregatedData {
		const name = 'Average Caching Rate';

		const totalCachedPercent : number = runs
			.reduce((sum : number, run : Run) => sum + run.stats.cachedPercent ?? 0, 0);

		const value = `${ roundToDecimals(totalCachedPercent / runs.length * 100) }%`;

		return {
			name,
			value,
		};
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

	public updateFilterMap(key : string, values? : any[]) : void {
		this.filterMap.update(item => {
			if (values == null) {
				delete item[ key ];
			} else {
				item[ key ] = values;
			}

			return item;
		});
	}

	public updateActiveSort(key : string) : void {
		this.activeSort.update((item : ActiveSort) => {
			if (item.key === key) {
				item.direction = item.direction === 'ascending'
					? 'descending'
					: 'ascending';
			} else {
				item.key = key;
				item.direction = 'ascending';
			}

			return item;
		});
	}
}

export const runsTable = new RunsTable();
