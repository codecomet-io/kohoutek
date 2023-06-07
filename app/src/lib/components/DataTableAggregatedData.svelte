<script lang="ts">
	import { lapsed, parseDate } from 'briznads-helpers';

	import { objectEntries } from '$lib/helper';
	import { runsTable } from '$lib/stores/runs-table';

	import LineGraph from '$lib/components/LineGraph.svelte';


	const { aggregatedDataMap } = runsTable;

	function formatXTicks(tick : number, ticks : number[]) : string {
		const options : any = {
			month : 'short',
			day   : 'numeric',
		};

		const getYear = (tick : number) => parseDate(tick).getFullYear();

		const upper = ticks[ 0 ];
		const lower = ticks[ ticks.length - 1 ];

		if (getYear(upper) !== getYear(lower)) {
			options.year = 'numeric';
		}

		return parseDate(tick).toLocaleString(undefined, options);
	}

	const formatYTicksMap : any = {
		machineTime : (tick : number) => lapsed(tick, true),
		cachedRate  : (tick : number) => `${ tick }%`,
	};
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
			border: 0.5px solid #c8c7cc;

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
</style>


<div class="aggregate-data-container">
	{#each objectEntries($aggregatedDataMap) as [ key, data ] }
		<ion-card class:has-graph={ data.chartCoordinates != null }>
			<ion-card-header>
				<ion-card-title>{ data.value }</ion-card-title>

				<ion-card-subtitle>{ data.name }</ion-card-subtitle>
			</ion-card-header>

			{#if data.chartCoordinates != null }
				<ion-card-content>
					<LineGraph
						coordinates={ data.chartCoordinates }
						{ formatXTicks }
						formatYTicks={ formatYTicksMap[ key ] }
						hideYTicks={ key === 'errorRate' }
					/>
				</ion-card-content>
			{/if}
		</ion-card>
	{/each}
</div>
