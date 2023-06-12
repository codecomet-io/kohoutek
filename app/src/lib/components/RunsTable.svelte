<script lang="ts">
	import type { Run } from '../../../../pantry/src/lib/model';

	import type { Options } from '$lib/types/data-table';

	import { getDateString, parseDate, getTimeString, lapsed, roundToDecimals } from 'briznads-helpers';
	import { chevronForwardOutline } from 'ionicons/icons';
	import { runsTable } from '$lib/stores/runs-table';

	import DataTable from '$lib/components/DataTable.svelte';
	import StatusIcon from '$lib/components/StatusIcon.svelte';
	import LineGraph from '$lib/components/LineGraph.svelte';


	export let searchParams : URLSearchParams;
	export let org : string;
	export let pipelineId : string;
	export let runs : Run[];


	function parseCellTitle(key : string, value : any) : string {
		let parsedValue = value?.toString();

		if (key === 'started') {
			parsedValue = getDateString(value);
		} else if (key === 'machineTime') {
			parsedValue += ` millisecond${ value === 1 ? '' : 's' }`;
		} else if (key === 'link') {
			parsedValue = 'View Run';
		}

		return parsedValue;
	}

	function parseRowLink(row : Run) : string {
		return `/${ org }/pipeline/${ pipelineId }/run/${ row.id }`;
	}

	function parseStartedValue(value : number) : string {
		const dateObj = parseDate(value);
		const ago = Date.now() - value;

		// if more than a day ago, show date and time
		return ago > 86400000
			? dateObj.toLocaleString(undefined, { dateStyle:'short', timeStyle:'short'})
			: getTimeString(dateObj);
	}

	function parseOptions(searchParams : URLSearchParams, runs : Run[]) : Options {
		return {
			initialRows : runs,
			columnMap : {
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
				formatYValue={ formatYValueMap[ key ] ?? ((item) => roundToDecimals(item).toString()) }
				hideYTicks={ key === 'erroredRate' }
				showTooltips={ key !== 'runsPerDay' }
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
			{ parseStartedValue(value) }
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
