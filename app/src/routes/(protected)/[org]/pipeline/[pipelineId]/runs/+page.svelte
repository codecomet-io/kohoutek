<script
	lang="ts"
	context="module"
>
	import type { PageData } from './$types';

	import { runsTable } from '$stores/runs-table';

	import ChunkyLabel from '$components/ChunkyLabel.svelte';
	import RunsTable from '$components/RunsTable.svelte';
</script>


<script lang="ts">
	export let data : PageData;

	const {
		rows,
	} = runsTable;
</script>


<style lang="scss">
	ion-card-title {
		margin-bottom: 20px;
	}
</style>


<ChunkyLabel>{ data.pipeline?.name ?? '' }</ChunkyLabel>

<ion-card-title>All Pipeline Runs ({ $rows?.length ?? 0 })</ion-card-title>

{#if data.org && data.pipeline?.id && data.runs }
	<RunsTable
		searchParams={ data.searchParams }
		org={ data.org }
		pipelineId={ data.pipeline.id }
		runs={ data.runs }
	/>
{/if }
