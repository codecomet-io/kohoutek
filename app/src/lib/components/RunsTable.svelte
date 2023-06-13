<script lang="ts">
	import type { Run } from '../../../../pantry/src/lib/model';

	import type { Options } from '$lib/types/data-table';

	import { getDateString, parseDate, getTimeString, lapsed, roundToDecimals } from 'briznads-helpers';
	import { chevronForwardOutline } from 'ionicons/icons';
	import { runsTable } from '$lib/stores/runs-table';

	import DataTable from '$lib/components/DataTable/component.svelte';
	import StatusIcon from '$lib/components/StatusIcon.svelte';
	import LineGraph from '$lib/components/LineGraph/component.svelte';


	export let searchParams : URLSearchParams;
	export let org : string;
	export let pipelineId : string;
	export let runs : Run[];


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

	function parseOptions(searchParams : URLSearchParams, runs : Run[]) : Options {
		return {
			namespace   : 'runs',
			initialRows : runs,
			columnMap   : {
				status : {
					name : 'Status',
					size : 0.5,
				},
				name : {
					name         : 'Name',
					size         : 2.5,
					unfilterable : true,
				},
				started : {
					name         : 'Started',
					unfilterable : true,
				},
				machineTime : {
					name : 'Duration',
				},
				'actor.name' : {
					name : 'Actor Name',
				},
				trigger : {
					name : 'Trigger',
				},
				erroredActionName : {
					name            : 'Errored Action',
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
			},
			parseRowLink,
			parseCellTitle,
		};
	}

	const formatYValueMap : any = {
		machineTime : (tick : number) => lapsed(tick, true),
		cachedRate  : (tick : number) => `${ tick }%`,
		runsPerDay  : (tick : number) => tick % 1 === 0
			? tick
			: '',
	};

	function parseFormatYValue(key : string) : (item : number, items? : number[]) => string {
		return formatYValueMap[ key ] ?? ((item : number) => roundToDecimals(item).toString());
	}
</script>


<style lang="scss"></style>


<DataTable
	{ searchParams }
	storeInstance={ runsTable }
	options={ parseOptions(searchParams, runs) }
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
				showTooltips={ key !== 'runsPerDay' }
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
		{:else if key === 'started' }
			{ parseDateValue(value) }
		{:else if key === 'machineTime' }
			{ lapsed(value, true) }
		{:else if key === 'link' }
			<ion-icon
				icon={ chevronForwardOutline }
				color="medium"
			></ion-icon>
		{:else}
			{ value ?? '' }
		{/if}
	</svelte:fragment>
</DataTable>
