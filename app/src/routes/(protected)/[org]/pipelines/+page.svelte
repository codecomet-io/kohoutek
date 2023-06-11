<script lang="ts">
	import type { PageData } from './$types';

	import PipelinesTable from '$lib/components/PipelinesTable.svelte';


	export let data : PageData;

	// $: console.debug('data', data);
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

	<ion-card-title>All Pipelines</ion-card-title>

	{#if data.org && data.pipelines }
		<PipelinesTable
			searchParams={ data.searchParams }
			org={ data.org }
			pipelines={ data.pipelines }
		/>
	{/if }
</ion-content>
