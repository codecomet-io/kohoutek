<script lang="ts">
	import type { PageData } from './$types';

	import RunsTable from '$lib/components/RunsTable.svelte';


	export let data : PageData;
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

	<ion-card-title>All Pipeline Runs</ion-card-title>

	{#if data.org && data.pipeline?.id && data.runs }
		<RunsTable
			searchParams={ data.searchParams }
			org={ data.org }
			pipelineId={ data.pipeline.id }
			runs={ data.runs }
		/>
	{/if }
</ion-content>
