<script lang="ts">
	import type { DataTable } from '$lib/stores/data-table';

	import { objectEntries } from 'briznads-helpers';

	import LineGraph from '$lib/components/LineGraph.svelte';


	export let storeInstance : DataTable;

	const {
		aggregatedDataMap,
	} = storeInstance;
</script>


<style lang="scss">
	.aggregate-data-container {
		display: flex;
		flex-wrap: wrap;
		gap: 1em;
		margin-bottom: 24px;

		@media (min-width: 992px) {
			flex-wrap: nowrap;
		}

		ion-card {
			flex: 1;
			min-width: 80%;
			margin: 0;
			border: 1px solid #c8c7cc;

			@media (min-width: 576px) {
				min-width: 40%;
			}

			@media (min-width: 992px) {
				min-width: auto;
			}
		}
	}

	ion-card:not(.has-graph) {
		height: min-content;

		ion-card-header {
			height: 100%;
			justify-content: space-between;
		}
	}

	.no-title {
		visibility: hidden;
	}
</style>


{#if Object.keys($aggregatedDataMap).length > 0 }
	<div class="aggregate-data-container">
		{#each objectEntries($aggregatedDataMap ?? {}) as [ key, data ] }
			<ion-card
				class:has-graph={ data.chartCoordinates && data.chartCoordinates.length > 1 }
			>
				<ion-card-header>
					<ion-card-title
						class:no-title={ data.title === '' }
					>
						{ data.title === '' ? 'no value' : data.title }
					</ion-card-title>

					<ion-card-subtitle>{ data.subtitle }</ion-card-subtitle>
				</ion-card-header>

				{#if data.chartCoordinates && data.chartCoordinates.length > 1 }
					<ion-card-content>
						<ion-card-subtitle>{ data.chartLabel }</ion-card-subtitle>

						{#if $$slots.default }
							<slot
								{ key }
								coordinates={ data.chartCoordinates }
							/>
						{:else }
							<LineGraph coordinates={ data.chartCoordinates } />
						{/if }
					</ion-card-content>
				{/if}
			</ion-card>
		{/each}
	</div>
{/if }
