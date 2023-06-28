<script
	lang="ts"
	context="module"
>
	import type { Pipeline } from '$pantry/types';

	import type { Options, ColumnMap } from '$types/data-table';
	import type { AggregatedHeadlineDataOptionsMap } from '$types/aggregated-headline-data';

	import { getDateString, parseDate, getTimeString, lapsed, roundToDecimals } from 'briznads-helpers';
	import { chevronForwardOutline } from 'ionicons/icons';
	import { pipelinesTable as storeInstance } from '$stores/pipelines-table';

	import DataTable from '$components/DataTable/component.svelte';
	import LineGraph from '$components/LineGraph/component.svelte';
</script>


<script lang="ts">
	export let searchParams : URLSearchParams;
	export let org : string;
	export let pipelines : Pipeline[];

	let options : Options;

	$: options = parseOptions(pipelines);

	function parseOptions(pipelines : Pipeline[]) : Options {
		const columnMap = getColumnMap();

		return {
			parseRowLink,
			parseCellTitle,
			columnMap,
			namespace                        : 'pipelines',
			initialRows                      : pipelines,
			aggregatedHeadlineDataOptionsMap : getAggregatedHeadlineDataOptionsMap(columnMap),
			defaultSort                      : {
				key : 'name',
			},
		};
	}

	function parseCellTitle(key : string, value : any) : string | null {
		if (key === 'firstRunAt' || key === 'lastRunAt') {
			return getDateString(value);
		} else if (key === 'machineTime') {
			return lapsed(value, true, true);
		} else if (key === 'link') {
			return 'View Run';
		} else if (key === 'number') {
			return null;
		} else {
			return value?.toString();
		}
	}

	function parseRowLink(pipeline : Pipeline) : string {
		return `/${ org }/pipeline/${ pipeline.id }/runs`;
	}

	function parseRowNumber(value : number, index? : number) : string {
		return index == null
			? ''
			: (index + 1).toString();
	}

	function parseDateValue(value : number) : string {
		const dateObj = parseDate(value);
		const ago = Date.now() - value;

		// if more than a day ago, show date and time
		return ago > 86400000
			? dateObj.toLocaleString(undefined, { dateStyle : 'short', timeStyle : 'short' })
			: getTimeString(dateObj);
	}

	function getColumnMap() : ColumnMap {
		return {
			number : {
				name              : '#',
				size              : 0.3,
				unfilterable      : true,
				unhideable        : true,
				parseDisplayValue : parseRowNumber,
			},
			name : {
				name         : 'Name',
				size         : 2,
				unfilterable : true,
			},
			firstRunAt : {
				name              : 'First Run',
				type              : 'datetime',
				parseDisplayValue : parseDateValue,
			},
			lastRunAt : {
				name              : 'Last Run',
				type              : 'datetime',
				parseDisplayValue : parseDateValue,
			},
			runCount : {
				name : 'Runs',
				size : 0.5,
			},
			'statusesMap.cancelled' : {
				name            : 'Cancelled Runs',
				initiallyHidden : true,
			},
			'statusesMap.completed' : {
				name                          : 'Completed Runs',
				aggregatedColumnDataDirection : 'descending',
			},
			'statusesMap.degraded' : {
				name                          : 'Degraded Runs',
				initiallyHidden               : true,
				aggregatedColumnDataDirection : 'ascending',
			},
			'statusesMap.errored' : {
				name                          : 'Errored Runs',
				aggregatedColumnDataDirection : 'ascending',
			},
			machineTime : {
				name                          : 'Total Machine Time',
				aggregatedColumnDataDirection : 'ascending',
				parseDisplayValue             : (value : number) => roundToDecimals(value / 1000 / 1000, 0) + ' min',
			},
			actionsCount : {
				name            : 'Attempted Actions',
				initiallyHidden : true,
			},
			cachedActionsCount : {
				name                          : 'Cached Actions',
				aggregatedColumnDataDirection : 'descending',
			},
			ranActionsCount : {
				name            : 'Ran Actions',
				initiallyHidden : true,
			},
			completedActionsCount : {
				name                          : 'Completed Actions',
				initiallyHidden               : true,
				aggregatedColumnDataDirection : 'descending',
			},
			erroredActionsCount : {
				name                          : 'Errored Actions',
				aggregatedColumnDataDirection : 'ascending',
			},
			interruptedActionsCount : {
				name            : 'Interrupted Actions',
				initiallyHidden : true,
			},
			notRanActionsCount : {
				name                          : 'Not Ran Actions',
				initiallyHidden               : true,
				aggregatedColumnDataDirection : 'ascending',
			},
			description : {
				name            : 'Description',
				size            : 3,
				unfilterable    : true,
				initiallyHidden : true,
			},
			repo : {
				name : 'Repository',
				type : 'string',
			},
			'triggersMap.manual' : {
				name            : 'Triggered Manually',
				initiallyHidden : true,
			},
			'triggersMap.automated' : {
				name            : 'Triggered Automatically',
				initiallyHidden : true,
			},
			link : {
				name         : 'Link',
				size         : 0.3,
				hiddenHeader : true,
				unfilterable : true,
				unhideable   : true,
			},
		};
	}

	function getAggregatedHeadlineDataOptionsMap(columnMap : ColumnMap) : AggregatedHeadlineDataOptionsMap {
		return {
			machineTime : {
				titleLabel   : 'Average Machine Time',
				chartLabel   : 'All Machine Time',
				parse        : storeInstance.machineTime.bind(storeInstance),
				formatYValue : columnMap.machineTime?.parseDisplayValue,
			},
			cachedActionsRate : {
				titleLabel   : 'Average Cached Actions Rate',
				chartLabel   : 'All Cached Actions Rate',
				parse        : storeInstance.cachedActionsRate.bind(storeInstance),
				formatYValue : (tick : number) => `${ roundToDecimals(tick, 1) }%`,
			},
			erroredRunRate : {
				titleLabel   : 'Average Errored Rate',
				chartLabel   : 'All Errored Rates',
				parse        : storeInstance.erroredRunRate.bind(storeInstance),
				formatYValue : (tick : number) => `${ roundToDecimals(tick, 1) }%`,
			},
			runCount : {
				titleLabel   : 'Average Run Count',
				chartLabel   : 'All Run Counts',
				parse        : storeInstance.runCount.bind(storeInstance),
			},
		};
	}
</script>


<style lang="scss"></style>


<DataTable
	{ searchParams }
	{ storeInstance }
	{ options }
>
	<svelte:fragment
		slot="cell"
		let:key
		let:value
		let:index
	>
		{#if key === 'link' }
			<ion-icon
				icon={ chevronForwardOutline }
				color="medium"
			></ion-icon>
		{:else }
			{ storeInstance.parseDisplayValue(key, value, index) }
		{/if }
	</svelte:fragment>
</DataTable>
