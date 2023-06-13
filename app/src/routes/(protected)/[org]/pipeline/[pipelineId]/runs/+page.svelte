<script lang="ts">
	import type { PageData } from './$types';

	import { runsTable } from '$lib/stores/runs-table';

	import RunsTable from '$lib/components/RunsTable.svelte';


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


<ion-content
	class="ion-padding"
	fullscreen={ true }
>
	<ion-card-subtitle>{ data.pipeline?.name ?? '' }</ion-card-subtitle>

	<ion-card-title>All Pipeline Runs ({ $rows?.length ?? 0 })</ion-card-title>

	{#if data.org && data.pipeline?.id && data.runs }
		<RunsTable
			searchParams={ data.searchParams }
			org={ data.org }
			pipelineId={ data.pipeline.id }
			runs={ data.runs }
		/>
	{/if }
</ion-content>
