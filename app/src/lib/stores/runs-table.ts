import type { NumberMap } from 'briznads-helpers';

import type { Row } from '$types/data-table';
import type { PartialAggregatedHeadlineData, Coordinate } from '$types/aggregated-headline-data';

import { objectEntries, smartSort, lapsed, roundToDecimals, parseDate } from 'briznads-helpers';

import { getEndpoints } from '$utilities/helper';
import { DataTable } from '$stores/data-table';


class RunsTable extends DataTable {
	constructor() {
		super();
	}


	public async machineTime(rows : Row[]) : Promise<PartialAggregatedHeadlineData> {
		const chartCoordinates = rows
			.map((row : Row) : Coordinate => [
				row.started,
				row.machineTime,
			]);

		smartSort(chartCoordinates, undefined, undefined, '0');

		const totalMachineTime = chartCoordinates.reduce((sum, [ x, y ] : Coordinate) => sum + y, 0);

		const title = lapsed(Math.floor(totalMachineTime / chartCoordinates.length), true);

		return {
			title,
			chartCoordinates,
		};
	}

	public async runsPerDay(rows : Row[]) : Promise<PartialAggregatedHeadlineData> {
		// await sleep(1);

		const runsByStarted : number[] = rows.map((row : Row) => row.started);

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

	public async erroredRate(rows : Row[]) : Promise<PartialAggregatedHeadlineData> {
		const chartCoordinates = rows.map((row : Row) : Coordinate => [
			row.started,
			row.status === 'errored'
				? 1
				: 0,
		]);

		smartSort(chartCoordinates, undefined, undefined, '0');

		const total : number = chartCoordinates
			.filter(([ x, y ] : Coordinate) => y)
			.length;

		const title = roundToDecimals(total / chartCoordinates.length * 100) + '%';

		return {
			title,
			chartCoordinates,
		};
	}

	public async cachedRate(rows : Row[]) : Promise<PartialAggregatedHeadlineData> {
		const chartCoordinates = rows.map((row : Row) : Coordinate => [
			row.started,
			row.stats?.cachedPercent ?? 0,
		]);

		smartSort(chartCoordinates, undefined, undefined, '0');

		const total : number = chartCoordinates
			.reduce((sum : number, [ x, y ] : Coordinate) => sum + y, 0);

		const title = roundToDecimals(total / chartCoordinates.length) + '%';

		return {
			title,
			chartCoordinates,
		};
	}
}

export const runsTable = new RunsTable();
