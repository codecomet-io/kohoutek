<script
	lang="ts"
	context="module"
>
	import type { PageData } from './$types';

	import { pipelinesTable } from '$stores/pipelines-table';

	import ChunkyLabel from '$components/ChunkyLabel.svelte';
	import PipelinesTable from '$components/PipelinesTable.svelte';
</script>


<script lang="ts">
	export let data : PageData;

	const {
		rows,
	} = pipelinesTable;
</script>


<style lang="scss">
	ion-card-title {
		margin-bottom: 20px;
	}
</style>


<ChunkyLabel>{ data.org ?? '' }</ChunkyLabel>

<ion-card-title>All Pipelines ({ $rows?.length ?? 0 })</ion-card-title>

{#if data.org && data.pipelines }
	<PipelinesTable
		searchParams={ data.searchParams }
		org={ data.org }
		pipelines={ data.pipelines }
	/>
{/if }
