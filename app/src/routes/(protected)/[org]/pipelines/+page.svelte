<script lang="ts">
	import type { PageData } from './$types';

	import { pipelinesTable } from '$lib/stores/pipelines-table';

	import PipelinesTable from '$lib/components/PipelinesTable.svelte';


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


<ion-content
	class="ion-padding"
	fullscreen={ true }
>
	<ion-card-subtitle>{ data.org ?? '' }</ion-card-subtitle>

	<ion-card-title>All Pipelines ({ $rows?.length ?? 0 })</ion-card-title>

	{#if data.org && data.pipelines }
		<PipelinesTable
			searchParams={ data.searchParams }
			org={ data.org }
			pipelines={ data.pipelines }
		/>
	{/if }
</ion-content>
