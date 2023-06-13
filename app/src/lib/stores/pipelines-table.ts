import type { Pipeline } from '../../../../pantry/src/lib/model';

import type { AggregatedDataMap, PartialAggregatedData, Coordinate } from '$lib/types/data-table';

import { DataTable } from '$lib/stores/data-table';

import { sleep, objectEntries, smartSort, lapsed, roundToDecimals, parseDate } from 'briznads-helpers';


class PipelinesTable extends DataTable {
	public defaultAggregatedDataMap : AggregatedDataMap = {
		machineTime : {
			title      : '',
			subtitle   : 'Average Machine Time',
			chartLabel : 'All Machine Time',
		},
		cachedActionsRate : {
			title      : '',
			subtitle   : 'Average Cached Actions Rate',
			chartLabel : 'All Cached Actions Rate',
		},
		erroredRunRate : {
			title      : '',
			subtitle   : 'Average Errored Rate',
			chartLabel : 'All Errored Rates',
		},
		runCount : {
			title      : '',
			subtitle   : 'Average Run Count',
			chartLabel : 'All Run Counts',
		},
	};


	constructor() {
		super();
	}


	public async setAggregatedDataMap(pipelines : Pipeline[], set : (value : any) => void, passedMap? : AggregatedDataMap) : Promise<void> {
		await sleep(1);

		const aggregatedDataMap = this.getDefaultAggregatedDataMap();

		for (const [ key, value ] of objectEntries(aggregatedDataMap)) {
			// @briznad: there doesn't appear to be a current solution to make this error go away
			// https://github.com/microsoft/TypeScript/issues/13543
			this[ key ](pipelines)
				.then((partialAggregatedData : PartialAggregatedData) => {
					// insure that the data is still relevant
					if (!this.updateAggregatedValues) {
						return;
					}

					aggregatedDataMap[ key ] = {
						...aggregatedDataMap[ key ],
						...partialAggregatedData,
					};

					super.setAggregatedDataMap(pipelines, set, aggregatedDataMap);
				});
		}
	}

	private async machineTime(pipelines : Pipeline[]) : Promise<PartialAggregatedData> {
		const chartCoordinates = pipelines
			.map((pipeline : Pipeline, index : number) : Coordinate => [
				index + 1,
				pipeline.machineTime,
			]);

		const totalMachineTime = chartCoordinates.reduce((sum, [ x, y ] : Coordinate) => sum + y, 0);

		const title = lapsed(Math.floor(totalMachineTime / chartCoordinates.length), true, true);

		return {
			title,
			chartCoordinates,
		};
	}

	private async cachedActionsRate(pipelines : Pipeline[]) : Promise<PartialAggregatedData> {
		const chartCoordinates = pipelines
			.map((pipeline : Pipeline, index : number) : Coordinate => [
				index + 1,
				roundToDecimals(pipeline.cachedActionsCount / pipeline.actionsCount * 100),
			]);

		const totalCachedActionsRate = chartCoordinates.reduce((sum, [ x, y ] : Coordinate) => sum + y, 0);

		const title = roundToDecimals(totalCachedActionsRate / chartCoordinates.length) + '%';

		return {
			title,
			chartCoordinates,
		};
	}

	private async erroredRunRate(pipelines : Pipeline[]) : Promise<PartialAggregatedData> {
		const chartCoordinates = pipelines
			.map((pipeline : Pipeline, index : number) : Coordinate => [
				index + 1,
				roundToDecimals(pipeline.statusesMap.errored / pipeline.runCount * 100),
			]);

		const totalErroredRate = chartCoordinates.reduce((sum, [ x, y ] : Coordinate) => sum + y, 0);

		const title = roundToDecimals(totalErroredRate / chartCoordinates.length) + '%';

		return {
			title,
			chartCoordinates,
		};
	}

	private async runCount(pipelines : Pipeline[]) : Promise<PartialAggregatedData> {
		const chartCoordinates = pipelines
			.map((pipeline : Pipeline, index : number) : Coordinate => [
				index + 1,
				pipeline.runCount,
			]);

		const totalRunCount = chartCoordinates.reduce((sum, [ x, y ] : Coordinate) => sum + y, 0);

		const title = roundToDecimals(totalRunCount / chartCoordinates.length);

		return {
			title,
			chartCoordinates,
		};
	}
}

export const pipelinesTable = new PipelinesTable();
