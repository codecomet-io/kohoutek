<script lang="ts">
	import { objectEntries } from '$lib/helper';
	import { runsTable } from '$lib/stores/runs-table';

	import LineGraph from '$lib/components/LineGraph.svelte';


	const { aggregatedDataMap } = runsTable;

	$: console.debug('aggregatedDataMap', objectEntries($aggregatedDataMap).map(item => item[1]	));
</script>


<style lang="scss">
	.aggregate-data-container {
		display: flex;
		gap: 1em;
		margin-bottom: 24px;

		ion-card {
			flex: 1;
			margin: 0;
			border: 0.5px solid #c8c7cc;
		}
	}

	ion-card:not(.has-graph) {
		height: min-content;

		ion-card-header {
			height: 100%;
			justify-content: space-between;
		}
	}
</style>


<div class="aggregate-data-container">
	{#each objectEntries($aggregatedDataMap) as [ key, data ] }
		{#if data.chartCoordinates != null }
			<ion-card class:has-graph={ data.chartCoordinates != null }>
				<ion-card-header>
					<ion-card-title>{ data.value }</ion-card-title>

					<ion-card-subtitle>{ data.name }</ion-card-subtitle>
				</ion-card-header>

				{#if data.chartCoordinates != null }
					<ion-card-content>
						<LineGraph coordinates={ data.chartCoordinates } />
					</ion-card-content>
				{/if}
			</ion-card>
		{/if}
	{/each}
</div>
