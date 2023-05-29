<script lang="ts">
	import { objectEntries } from '$lib/helper';
	import { runsTable } from '$lib/stores/runs-table';

	import LineGraph from '$lib/components/LineGraph.svelte';


	const { aggregatedDataMap } = runsTable;
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

	ion-card-header {
		height: 100%;
		justify-content: space-between;
	}
</style>


<div class="aggregate-data-container">
	{#each objectEntries($aggregatedDataMap) as [ key, data ] }
		<ion-card>
			<ion-card-header>
				<ion-card-title>{ data.value }</ion-card-title>

				<ion-card-subtitle>{ data.name }</ion-card-subtitle>
			</ion-card-header>

			{#if data.chartCoordinates != null && false }
				<ion-card-content>
					<LineGraph data={ data.chartCoordinates } />
				</ion-card-content>
			{/if}
		</ion-card>
	{/each}
</div>
