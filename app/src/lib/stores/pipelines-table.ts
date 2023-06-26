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

		let title;

		if (this.opts.columnMap.machineTime.parseDisplayValue) {
			title = this.opts.columnMap.machineTime.parseDisplayValue(total / chartCoordinates.length);
		}

		return {
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

		const title = roundToDecimals(total / chartCoordinates.length) + '%';

		return {
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

		const title = roundToDecimals(total / chartCoordinates.length) + '%';

		return {
			title,
			chartCoordinates,
		};
	}

	public async runCount(rows : Row[]) : Promise<PartialAggregatedHeadlineData> {
		const chartCoordinates = this.getChartCoordinates(rows, 'runCount');

		const total = chartCoordinates.reduce((sum, [ x, y ] : Coordinate) => sum + y, 0);

		const title = roundToDecimals(total / chartCoordinates.length);

		return {
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
