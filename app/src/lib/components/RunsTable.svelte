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
		const columnMap = getColumnMap();

		return {
			parseRowLink,
			parseCellTitle,
			columnMap,
			namespace                        : 'runs',
			initialRows                      : runs,
			aggregatedHeadlineDataOptionsMap : getAggregatedHeadlineDataOptionsMap(columnMap),
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
			defaultSort                      : {
				key       : 'started',
				direction : 'descending',
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
		// convert "ago" to absolute value to account for future dates
		return Math.abs(ago) > 86400000
			? dateObj.toLocaleString(undefined, { dateStyle : 'short', timeStyle : 'short' })
			: getTimeString(dateObj);
	}

	function getColumnMap() : ColumnMap {
		return {
			status : {
				name : 'Status',
				type : 'string',
				size : 0.5,
			},
			name : {
				name         : 'Name',
				size         : 2.5,
				unfilterable : true,
			},
			started : {
				name              : 'Started',
				type              : 'datetime',
				unfilterable      : true,
				parseDisplayValue : parseDateValue,
			},
			machineTime : {
				name              : 'Duration',
				parseDisplayValue : (value : number) => lapsed(value, true),
			},
			'actor.name' : {
				name : 'Actor Name',
				type : 'string',
			},
			trigger : {
				name : 'Trigger',
				type : 'string',
			},
			erroredActionName : {
				name            : 'Errored Action',
				type            : 'string',
				size            : 2,
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
				titleLabel    : 'Average Duration',
				chartLabel    : 'All Durations',
				parse         : storeInstance.machineTime.bind(storeInstance),
				formatYValue  : columnMap.machineTime?.parseDisplayValue,
				xValueType    : 'date',
				timeFilterKey : 'started',
				showTooltips  : true,
			},
			runsPerDay : {
				titleLabel    : 'Average Runs Per Day',
				chartLabel    : 'All Runs Per Day',
				parse         : storeInstance.runsPerDay.bind(storeInstance),
				formatYValue  : (tick : number) => tick % 1 === 0
					? tick.toString()
					: '',
				xValueType    : 'date',
				timeFilterKey : 'started',
			},
			erroredRate : {
				titleLabel    : 'Average Errored Rate',
				chartLabel    : 'All Errored Rates',
				parse         : storeInstance.erroredRate.bind(storeInstance),
				xValueType    : 'date',
				timeFilterKey : 'started',
				hideYTicks    : true,
			},
			cachedRate : {
				titleLabel    : 'Average Cached Rate',
				chartLabel    : 'All Cached Rates',
				parse         : storeInstance.cachedRate.bind(storeInstance),
				formatYValue  : (tick : number) => `${ tick }%`,
				xValueType    : 'date',
				timeFilterKey : 'started',
				showTooltips  : true,
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
