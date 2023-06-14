<script
	lang="ts"
	context="module"
>
	import type { DataTable } from '$lib/stores/data-table';

	import { objectEntries } from 'briznads-helpers';

	import LineGraph from '$lib/components/LineGraph/component.svelte';
</script>


<script lang="ts">
	export let storeInstance : DataTable;

	const {
		aggregatedHeadlineDataMap,
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
	}

	ion-card {
		flex: 1;
		min-width: 80%;
		margin: 0;
		border: 1px solid #c8c7cc;
		box-shadow: var(--drop-shadow);

		&:not(.has-graph) {
			height: min-content;

			ion-card-header {
				height: 100%;
				justify-content: space-between;
			}
		}

		@media (min-width: 576px) {
			min-width: 40%;
		}

		@media (min-width: 992px) {
			min-width: auto;
		}
	}

	.no-title {
		visibility: hidden;
	}

	ion-card-subtitle {
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
	}
</style>


{#if Object.keys($aggregatedHeadlineDataMap).length > 0 }
	<div class="aggregate-data-container">
		{#each objectEntries($aggregatedHeadlineDataMap) as [ key, data ] }
			<ion-card
				class:has-graph={ data.chartCoordinates && data.chartCoordinates.length > 1 }
			>
				<ion-card-header>
					<ion-card-title
						class:no-title={ !data.title }
					>
						{ !data.title ? 'no value' : data.title }
					</ion-card-title>

					<ion-card-subtitle>{ data.titleLabel }</ion-card-subtitle>
				</ion-card-header>

				{#if data.chartCoordinates && data.chartCoordinates.length > 1 }
					<ion-card-content>
						{#if data.chartLabel }
							<ion-card-subtitle>{ data.chartLabel }</ion-card-subtitle>
						{/if}

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
