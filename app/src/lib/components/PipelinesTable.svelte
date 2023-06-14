<script
	lang="ts"
	context="module"
>
	import type { Pipeline } from '../../../../pantry/src/lib/model';

	import type { Options, ColumnMap } from '$lib/types/data-table';
	import type { AggregatedHeadlineDataOptionsMap } from '$lib/types/aggregated-headline-data';

	import { getDateString, parseDate, getTimeString, lapsed, roundToDecimals } from 'briznads-helpers';
	import { chevronForwardOutline } from 'ionicons/icons';
	import { pipelinesTable } from '$lib/stores/pipelines-table';

	import DataTable from '$lib/components/DataTable/component.svelte';
	import LineGraph from '$lib/components/LineGraph/component.svelte';
</script>


<script lang="ts">
	export let searchParams : URLSearchParams;
	export let org : string;
	export let pipelines : Pipeline[];

	let options : Options;

	$: options = parseOptions(pipelines);

	function parseOptions(pipelines : Pipeline[]) : Options {
		return {
			parseRowLink,
			parseCellTitle,
			namespace                        : 'pipelines',
			initialRows                      : pipelines,
			columnMap                        : getColumnMap(),
			aggregatedHeadlineDataOptionsMap : getAggregatedHeadlineDataOptionsMap(),
			defaultTimeFilter                : false,
		};
	}

	function parseCellTitle(key : string, value : any) : string {
		if (key === 'firstRunAt' || key === 'lastRunAt') {
			return getDateString(value);
		} else if (key === 'machineTime') {
			return lapsed(value, true, true);
		} else if (key === 'link') {
			return 'View Run';
		} else {
			return value?.toString();
		}
	}

	function parseRowLink(pipeline : Pipeline) : string {
		return `/${ org }/pipeline/${ pipeline.id }/runs`;
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
			name : {
				name         : 'Name',
				size         : 2,
				unfilterable : true,
			},
			firstRunAt : {
				name              : 'First Run',
				parseDisplayValue : parseDateValue,
			},
			lastRunAt : {
				name              : 'Last Run',
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
				name         : 'Repository',
				numericValue : false,
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

	function getAggregatedHeadlineDataOptionsMap() : AggregatedHeadlineDataOptionsMap {
		return {
			machineTime : {
				titleLabel : 'Average Machine Time',
				chartLabel : 'All Machine Time',
				parse      : pipelinesTable.machineTime.bind(pipelinesTable),
			},
			cachedActionsRate : {
				titleLabel : 'Average Cached Actions Rate',
				chartLabel : 'All Cached Actions Rate',
				parse      : pipelinesTable.cachedActionsRate.bind(pipelinesTable),
			},
			erroredRunRate : {
				titleLabel : 'Average Errored Rate',
				chartLabel : 'All Errored Rates',
				parse      : pipelinesTable.erroredRunRate.bind(pipelinesTable),
			},
			runCount : {
				titleLabel : 'Average Run Count',
				chartLabel : 'All Run Counts',
				parse      : pipelinesTable.runCount.bind(pipelinesTable),
			},
		};
	}

	const formatYValueMap : any = {
		cachedActionsRate : (tick : number) => `${ roundToDecimals(tick, 1) }%`,
		erroredRunRate    : (tick : number) => `${ roundToDecimals(tick, 1) }%`,
	};

	function parseFormatYValue(key : string) : (item : number, items? : number[]) => string {
		return options.columnMap[ key ]?.parseDisplayValue
			?? formatYValueMap[ key ]
			?? ((item : number) => roundToDecimals(item).toString());
	}
</script>


<style lang="scss"></style>


<DataTable
	{ searchParams }
	storeInstance={ pipelinesTable }
	{ options }
>
	<svelte:fragment
		slot="aggregatedChart"
		let:key
		let:coordinates
	>
		{#if coordinates }
			<LineGraph
				{ coordinates }
				formatYValue={ parseFormatYValue(key) }
				xValueType={ undefined }
			/>
		{/if }
	</svelte:fragment>

	<svelte:fragment
		slot="cell"
		let:key
		let:value
	>
		{#if key === 'link' }
			<ion-icon
				icon={ chevronForwardOutline }
				color="medium"
				size="medium"
			></ion-icon>
		{:else }
			{ (options?.columnMap?.[ key ]?.parseDisplayValue ?? ((value) => value?.toString() ?? ''))(value) }
		{/if }
	</svelte:fragment>
</DataTable>
