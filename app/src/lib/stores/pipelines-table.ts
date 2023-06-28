import type { Row } from '$types/data-table';
import type { PartialAggregatedHeadlineData, Coordinate } from '$types/aggregated-headline-data';

import { roundToDecimals } from 'briznads-helpers';

import { DataTable } from '$stores/data-table';


class PipelinesTable extends DataTable {
	constructor() {
		super();
	}


	public async machineTime(rows : Row[]) : Promise<PartialAggregatedHeadlineData> {
		const chartCoordinates = this.getChartCoordinates(rows, 'machineTime');

		const total = chartCoordinates.reduce((sum, [ x, y ] : Coordinate) => sum + y, 0);

		const aggregatedValue = roundToDecimals(total / chartCoordinates.length);

		const title = this.opts?.columnMap?.machineTime?.parseDisplayValue
			? this.opts.columnMap.machineTime.parseDisplayValue(aggregatedValue)
			: aggregatedValue.toString();

		return {
			aggregatedValue,
			title,
			chartCoordinates,
		};
	}

	public async cachedActionsRate(rows : Row[]) : Promise<PartialAggregatedHeadlineData> {
		const chartCoordinates = this.getChartCoordinates(
			rows,
			(row) => roundToDecimals(row.cachedActionsCount / row.actionsCount * 100),
		);

		const total = chartCoordinates.reduce((sum, [ x, y ] : Coordinate) => sum + y, 0);

		const aggregatedValue = roundToDecimals(total / chartCoordinates.length);

		const title = aggregatedValue + '%';

		return {
			aggregatedValue,
			title,
			chartCoordinates,
		};
	}

	public async erroredRunRate(rows : Row[]) : Promise<PartialAggregatedHeadlineData> {
		const chartCoordinates = this.getChartCoordinates(
			rows,
			(row) => roundToDecimals(row.statusesMap.errored / row.runCount * 100),
		);

		const total = chartCoordinates.reduce((sum, [ x, y ] : Coordinate) => sum + y, 0);

		const aggregatedValue = roundToDecimals(total / chartCoordinates.length);

		const title = aggregatedValue + '%';

		return {
			aggregatedValue,
			title,
			chartCoordinates,
		};
	}

	public async runCount(rows : Row[]) : Promise<PartialAggregatedHeadlineData> {
		const chartCoordinates = this.getChartCoordinates(rows, 'runCount');

		const total = chartCoordinates.reduce((sum, [ x, y ] : Coordinate) => sum + y, 0);

		const aggregatedValue = roundToDecimals(total / chartCoordinates.length);

		const title = aggregatedValue.toString();

		return {
			aggregatedValue,
			title,
			chartCoordinates,
		};
	}

	private getChartCoordinates(rows : Row[], parse : string | ((row : Row) => number)) : Coordinate[] {
		return rows
			.map((row : Row, index : number) : Coordinate => [
				index + 1,
				typeof parse === 'string'
					? row[ parse ]
					: parse(row),
			]);
	}
}

export const pipelinesTable = new PipelinesTable();
