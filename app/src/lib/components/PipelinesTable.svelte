<script lang="ts">
	import type { Pipeline } from '../../../../pantry/src/lib/model';

	import type { Options } from '$lib/types/data-table';

	import { getDateString, parseDate, getTimeString, lapsed } from 'briznads-helpers';
	import { chevronForwardOutline } from 'ionicons/icons';
	import { pipelinesTable } from '$lib/stores/pipelines-table';

	import DataTable from '$lib/components/DataTable.svelte';
	import StatusIcon from '$lib/components/StatusIcon.svelte';


	export let searchParams : URLSearchParams;
	export let org : string;
	export let pipelines : Pipeline[];


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

	function parseRowLink(pipeline : Pipeline) : string {
		return `/${ org }/pipeline/${ pipeline.id }/runs`;
	}

	function parseStartedValue(value : number) : string {
		const dateObj = parseDate(value);
		const ago = Date.now() - value;

		// if more than a day ago, show date and time
		return ago > 86400000
			? dateObj.toLocaleString(undefined, { dateStyle:'short', timeStyle:'short'})
			: getTimeString(dateObj);
	}

	function parseOptions(searchParams : URLSearchParams, pipelines : Pipeline[]) : Options {
		return {
			initialRows : pipelines,
			columnMap : {
				name : {
					name         : 'Name',
					size         : 2.5,
					unfilterable : true,
				},
				description : {
					name         : 'Description',
					size         : 3,
					unfilterable : true,
				},
				repo : {
					name : 'Repository',
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
			defaultTimeFilter     : false,
			includeAggregatedData : false,
		};
	}
</script>


<style lang="scss"></style>


<DataTable
	{ searchParams }
	storeInstance={ pipelinesTable }
	options={ parseOptions(searchParams, pipelines) }
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
