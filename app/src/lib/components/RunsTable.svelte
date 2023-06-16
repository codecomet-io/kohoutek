<script
	lang="ts"
	context="module"
>
	import type { Run } from '../../../../pantry/src/lib/model';

	import type { Options, ColumnMap } from '$lib/types/data-table';
	import type { AggregatedHeadlineDataOptionsMap } from '$lib/types/aggregated-headline-data';

	import { getDateString, parseDate, getTimeString, lapsed, roundToDecimals } from 'briznads-helpers';
	import { chevronForwardOutline } from 'ionicons/icons';
	import { runsTable as storeInstance } from '$lib/stores/runs-table';

	import DataTable from '$lib/components/DataTable/component.svelte';
	import StatusIcon from '$lib/components/StatusIcon.svelte';
	import LineGraph from '$lib/components/LineGraph/component.svelte';
</script>


<script lang="ts">
	export let searchParams : URLSearchParams;
	export let org : string;
	export let pipelineId : string;
	export let runs : Run[];

	let options : Options;

	$: options = parseOptions(runs);

	function parseOptions(runs : Run[]) : Options {
		return {
			parseRowLink,
			parseCellTitle,
			namespace                        : 'runs',
			initialRows                      : runs,
			columnMap                        : getColumnMap(),
			aggregatedHeadlineDataOptionsMap : getAggregatedHeadlineDataOptionsMap(),
			defaultTimeFilter                : {
				key   : 'started',
				value : [ 'last 30 days' ],
				options : [
					'last 24 hours',
					'last 3 days',
					'last 7 days',
					'last 30 days',
					'last 90 days',
					'last 365 days',
				],
				allowCustomRange : true,
			},
		};
	}

	function parseCellTitle(key : string, value : any) : string {
		if (key === 'started') {
			return getDateString(value);
		} else if (key === 'machineTime') {
			return lapsed(value, true, true);
		} else if (key === 'link') {
			return 'View Run';
		} else {
			return value?.toString();
		}
	}

	function parseRowLink(row : Run) : string {
		return `/${ org }/pipeline/${ pipelineId }/run/${ row.id }`;
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
			status : {
				name         : 'Status',
				size         : 0.5,
				numericValue : false,
			},
			name : {
				name         : 'Name',
				size         : 2.5,
				unfilterable : true,
			},
			started : {
				name              : 'Started',
				unfilterable      : true,
				parseDisplayValue : parseDateValue,
			},
			machineTime : {
				name              : 'Duration',
				parseDisplayValue : (value : number) => lapsed(value, true),
			},
			'actor.name' : {
				name         : 'Actor Name',
				numericValue : false,
			},
			trigger : {
				name         : 'Trigger',
				numericValue : false,
			},
			erroredActionName : {
				name            : 'Errored Action',
				size            : 2,
				initiallyHidden : true,
				numericValue    : false,
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
				titleLabel : 'Average Duration',
				chartLabel : 'All Durations',
				parse      : storeInstance.machineTime.bind(storeInstance),
			},
			runsPerDay : {
				titleLabel : 'Average Runs Per Day',
				chartLabel : 'All Runs Per Day',
				parse      : storeInstance.runsPerDay.bind(storeInstance),
			},
			erroredRate : {
				titleLabel : 'Average Errored Rate',
				chartLabel : 'All Errored Rates',
				parse      : storeInstance.erroredRate.bind(storeInstance),
			},
			cachedRate : {
				titleLabel : 'Average Cached Rate',
				chartLabel : 'All Cached Rates',
				parse      : storeInstance.cachedRate.bind(storeInstance),
			},
		};
	}

	const formatYValueMap : any = {
		cachedRate  : (tick : number) => `${ tick }%`,
		runsPerDay  : (tick : number) => tick % 1 === 0
			? tick
			: '',
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
	{ storeInstance }
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
				hideYTicks={ key === 'erroredRate' }
				showTooltips={ key === 'machineTime' || key === 'cachedRate' }
				xValueType="date"
			/>
		{/if }
	</svelte:fragment>

	<svelte:fragment
		slot="cell"
		let:key
		let:value
	>
		{#if key === 'status' }
			<StatusIcon
				size="small"
				status={ value }
			/>
		{:else if key === 'link' }
			<ion-icon
				icon={ chevronForwardOutline }
				color="medium"
			></ion-icon>
		{:else }
			{ storeInstance.parseDisplayValue(key, value) }
		{/if }
	</svelte:fragment>
</DataTable>
