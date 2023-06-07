import type { Readable } from 'svelte/store';
import type { NumberMap } from 'briznads-helpers';

import type { Run } from '../../../../pantry/src/lib/model';

import type { AggregatedDataMap, AggregatedData, Coordinate } from '$lib/types/runs-table';

import { derived, get } from 'svelte/store';
import { lapsed, smartSort, roundToDecimals, parseDate, objectEntries, sleep } from 'briznads-helpers';

import { getEndpoints } from '$lib/helper';

import { runsTable } from '$lib/stores/runs-table';


class AggregatedDataRuns {
	public aggregatedDataMap : Readable<AggregatedDataMap>;

	private cachedRunsStr : string = '';

	private readonly defaultAggregatedDataMap : AggregatedDataMap = this.getDefaultAggregatedDataMap();


	constructor() {
		// setup derived stores
		this.aggregatedDataMap = this.initAggregatedDataMap();
	}


	private getDefaultAggregatedDataMap() : AggregatedDataMap {
		const value = '';
		const y = 0;

		const now = Date.now();

		const chartCoordinates : Coordinate[] = [
			{
				y,
				x : now - 1,
			},
			{
				y,
				x : now,
			},
			{
				y,
				x : now + 1,
			},
		];

		return {
			machineTime : {
				value,
				chartCoordinates,
				name : 'Average Duration',
			},
			runsPerDay : {
				value,
				chartCoordinates,
				name : 'Average Runs Per Day',
			},
			erroredRate : {
				value,
				chartCoordinates,
				name : 'Average Errored Rate',
			},
			cachedRate : {
				value,
				chartCoordinates,
				name : 'Average Cached Rate',
			},
		};
	}

	private initAggregatedDataMap() : Readable<AggregatedDataMap> {
		return derived(
			[
				runsTable.runs,
			],
			([
				$runs,
			], set) : void => {
				if (this.runsAreUnchanged($runs)) {
					return;
				}

				this.setAggregateDataMap($runs, set);
			},
			this.defaultAggregatedDataMap,
		);
	}

	private runsAreUnchanged(runs : Run[]) : boolean {
		const runsArr = runs.map((run : Run) => run.id);

		smartSort(runsArr);

		const runsStr = runsArr.join('');

		const unchanged = runsStr === this.cachedRunsStr;

		if (!unchanged) {
			this.cachedRunsStr = runsStr;
		}

		return unchanged;
	}

	private async setAggregateDataMap(runs : Run[], set : (value : any) => void) : Promise<void> {
		// await sleep(1);

		const aggregatedDataMap = get(this.aggregatedDataMap);

		for (const [ key, value ] of objectEntries(aggregatedDataMap)) {
			// @briznad: there doesn't appear to be a current solution to make this error go away
			// https://github.com/microsoft/TypeScript/issues/13543
			this[ key ](value.name, runs)
				.then((aggregatedData : AggregatedData) => {
					aggregatedDataMap[ key ] = aggregatedData;

					set(aggregatedDataMap);
				});
		}
	}

	private async machineTime(name : string, runs : Run[]) : Promise<AggregatedData> {
		const chartCoordinates = runs.map((run : Run) => ({
			x : run.started,
			y : run.machineTime,
		}));

		smartSort(chartCoordinates, undefined, undefined, 'x');

		const totalMachineTime = chartCoordinates.reduce((sum, coord : Coordinate) => sum + coord.y, 0);

		const value = lapsed(Math.floor(totalMachineTime / chartCoordinates.length), true);

		return {
			name,
			value,
			chartCoordinates,
		};
	}

	private async runsPerDay(name : string, runs : Run[]) : Promise<AggregatedData> {
		await sleep(1);

		const runsByStarted : number[] = runs.map((run : Run) => run.started);

		// const { lower, upper } = getEndpoints(runsByStarted);

		// calculate the time difference of two dates
    // const difference = upper - lower;

		// calculate the no. of days between two dates, inclusive
		// const daySpread = Math.round(difference / (1000 * 3600 * 24)) + 1;

		// const value = roundToDecimals(runsByStarted.length / daySpread);

		const runsPerDayMap : NumberMap = {};

		for (const started of runsByStarted) {
			const dateString = this.getDateString(started);

			if (!runsPerDayMap[ dateString ]) {
				runsPerDayMap[ dateString ] = 0;
			}

			runsPerDayMap[ dateString ]++;
		}

		const { lower, upper } = getEndpoints(runsByStarted);

		const upperDateString = this.getDateString(upper);
		const lowerDateString = this.getDateString(lower);

		const iterableDate = new Date(lowerDateString);

		while (true) {
			iterableDate.setDate(iterableDate.getDate() + 1);

			const dateString = this.getDateString(iterableDate);

			if (dateString === upperDateString) {
				break;
			} else if (dateString in runsPerDayMap) {
				continue;
			}

			runsPerDayMap[ dateString ] = 0;
		}

		const chartCoordinates = objectEntries(runsPerDayMap)
			.map(([ dateString, count ]) => ({
				x : new Date(dateString as string).getTime(),
				y : count,
			}));

		smartSort(chartCoordinates, undefined, undefined, 'x');

		const value = roundToDecimals(runsByStarted.length / chartCoordinates.length);

		return {
			name,
			value,
			chartCoordinates,
		};
	}

	private getDateString(date : number | Date) : string {
		return parseDate(date).toLocaleString(undefined, { dateStyle : 'medium' });
	}

	private async erroredRate(name : string, runs : Run[]) : Promise<AggregatedData> {
		const chartCoordinates = runs.map((run : Run) => ({
			x : run.started,
			y : run.status === 'errored' ? 1 : 0,
		}));

		smartSort(chartCoordinates, undefined, undefined, 'x');

		const erroredRuns : number = chartCoordinates
			.filter((coord : Coordinate) => coord.y)
			.length;

		const value = `${ roundToDecimals(erroredRuns / chartCoordinates.length * 100) }%`;

		return {
			name,
			value,
			chartCoordinates,
		};
	}

	private async cachedRate(name : string, runs : Run[]) : Promise<AggregatedData> {
		const chartCoordinates = runs.map((run : Run) => ({
			x : run.started,
			y : run.stats?.cachedPercent ?? 0,
		}));

		smartSort(chartCoordinates, undefined, undefined, 'x');

		const totalCachedPercent : number = chartCoordinates
			.reduce((sum : number, coord : Coordinate) => sum + coord.y, 0);

		const value = `${ roundToDecimals(totalCachedPercent / chartCoordinates.length * 100) }%`;

		return {
			name,
			value,
			chartCoordinates,
		};
	}
}

export const aggregatedDataRuns = new AggregatedDataRuns();
