import type { Readable } from 'svelte/store';
import type { NumberMap } from 'briznads-helpers';

import type { Run } from '../../../../pantry/src/lib/model';

import type { AggregatedDataMap, AggregatedData, Coordinate } from '$lib/types/runs-table';

import { derived } from 'svelte/store';
import { lapsed, smartSort, roundToDecimals, parseDate, objectEntries, sleep, deepCopy } from 'briznads-helpers';

import { getEndpoints } from '$lib/helper';

import { runsTable } from '$lib/stores/runs-table';


type PartialAggregatedData = Partial<AggregatedData>;


class AggregatedDataRuns {
	public aggregatedDataMap : Readable<AggregatedDataMap>;

	private updateValues : boolean = false;


	constructor() {
		// setup derived stores
		this.aggregatedDataMap = this.initAggregatedDataMap();
	}


	private getDefaultAggregatedDataMap() : AggregatedDataMap {
		const title = '';

		const aggregatedDataMap : AggregatedDataMap = {
			machineTime : {
				title,
				subtitle   : 'Average Duration',
				chartLabel : 'All Durations',
			},
			runsPerDay : {
				title,
				subtitle   : 'Average Runs Per Day',
				chartLabel : 'All Runs Per Day',
			},
			erroredRate : {
				title,
				subtitle   : 'Average Errored Rate',
				chartLabel : 'All Errored Rates',
			},
			cachedRate : {
				title,
				subtitle   : 'Average Cached Rate',
				chartLabel : 'All Cached Rates',
			},
		};

		return deepCopy(aggregatedDataMap);
	}

	private initAggregatedDataMap() : Readable<AggregatedDataMap> {
		return derived(
			runsTable.queriedRuns,
			(
				$runs : Run[],
				set  : (value : any) => void,
			) : void => {
				if ($runs?.length) {
					this.updateValues = true;

					this.setAggregateDataMap($runs, set);
				} else {
					this.updateValues = false;

					set(this.getDefaultAggregatedDataMap());
				}
			},
			this.getDefaultAggregatedDataMap(),
		);
	}

	private async setAggregateDataMap(runs : Run[], set : (value : any) => void) : Promise<void> {
		await sleep(1);

		const aggregatedDataMap = this.getDefaultAggregatedDataMap();

		for (const [ key, value ] of objectEntries(aggregatedDataMap)) {
			// @briznad: there doesn't appear to be a current solution to make this error go away
			// https://github.com/microsoft/TypeScript/issues/13543
			this[ key ](runs)
				.then((partialAggregatedData : PartialAggregatedData) => {
					// insure that the data is still relevant
					if (!this.updateValues) {
						return;
					}

					aggregatedDataMap[ key ] = {
						...aggregatedDataMap[ key ],
						...partialAggregatedData,
					};

					set(aggregatedDataMap);
				});
		}
	}

	private async machineTime(runs : Run[]) : Promise<PartialAggregatedData> {
		const chartCoordinates = runs
			.map((run : Run) : Coordinate => [
				run.started,
				run.machineTime,
			]);

		smartSort(chartCoordinates, undefined, undefined, '0');

		const totalMachineTime = chartCoordinates.reduce((sum, [ x, y ] : Coordinate) => sum + y, 0);

		const title = lapsed(Math.floor(totalMachineTime / chartCoordinates.length), true);

		return {
			title,
			chartCoordinates,
		};
	}

	private async runsPerDay(runs : Run[]) : Promise<PartialAggregatedData> {
		// await sleep(1);

		const runsByStarted : number[] = runs.map((run : Run) => run.started);

		const runsPerDayMap : NumberMap = {};

		for (const started of runsByStarted) {
			const dateString = this.getDateString(started);

			if (!runsPerDayMap[ dateString ]) {
				runsPerDayMap[ dateString ] = 0;
			}

			runsPerDayMap[ dateString ]++;
		}

		const { lower, upper } = getEndpoints(runsByStarted);

		if (lower !== upper) {
			this.populateMissingDays(runsPerDayMap, lower, upper);
		}

		const chartCoordinates = objectEntries(runsPerDayMap)
			.map(([ dateString, count ]) : Coordinate => [
				new Date(dateString as string).getTime(),
				count,
			]);

		smartSort(chartCoordinates, undefined, undefined, '0');

		const title = roundToDecimals(runsByStarted.length / chartCoordinates.length);

		return {
			title,
			chartCoordinates,
		};
	}

	private getDateString(date : number | Date) : string {
		return parseDate(date).toLocaleString(undefined, { dateStyle : 'medium' });
	}

	private populateMissingDays(runsPerDayMap : NumberMap, lower : number, upper : number) : void {
		const upperDateString = this.getDateString(upper);
		const lowerDateString = this.getDateString(lower);

		const iterableDate = new Date(lowerDateString);

		const safetyLimit : number = 100000;
		let safetyCounter : number = 0;

		while (safetyCounter <= safetyLimit) {
			safetyCounter++;

			if (safetyCounter > safetyLimit) {
				console.error(`loop exceeded iteration limit of ${ safetyLimit }`);
			}

			iterableDate.setDate(iterableDate.getDate() + 1);

			const dateString = this.getDateString(iterableDate);

			if (dateString === upperDateString) {
				break;
			} else if (dateString in runsPerDayMap) {
				continue;
			}

			runsPerDayMap[ dateString ] = 0;
		}
	}

	private async erroredRate(runs : Run[]) : Promise<PartialAggregatedData> {
		const chartCoordinates = runs.map((run : Run) : Coordinate => [
			run.started,
			run.status === 'errored'
				? 1
				: 0,
		]);

		smartSort(chartCoordinates, undefined, undefined, '0');

		const erroredRuns : number = chartCoordinates
			.filter(([ x, y ] : Coordinate) => y)
			.length;

		const title = `${ roundToDecimals(erroredRuns / chartCoordinates.length * 100) }%`;

		return {
			title,
			chartCoordinates,
		};
	}

	private async cachedRate(runs : Run[]) : Promise<PartialAggregatedData> {
		const chartCoordinates = runs.map((run : Run) : Coordinate => [
			run.started,
			run.stats?.cachedPercent ?? 0,
		]);

		smartSort(chartCoordinates, undefined, undefined, '0');

		const totalCachedPercent : number = chartCoordinates
			.reduce((sum : number, [ x, y ] : Coordinate) => sum + y, 0);

		const title = `${ roundToDecimals(totalCachedPercent / chartCoordinates.length * 100) }%`;

		return {
			title,
			chartCoordinates,
		};
	}
}

export const aggregatedDataRuns = new AggregatedDataRuns();
