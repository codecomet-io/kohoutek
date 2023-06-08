<script lang="ts">
	import { lapsed, parseDate, objectEntries } from 'briznads-helpers';

	import { aggregatedDataRuns } from '$lib/stores/aggregated-data-runs';

	import LineGraph from '$lib/components/LineGraph.svelte';


	const { aggregatedDataMap } = aggregatedDataRuns;

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
		runsPerDay  : (tick : number) => tick % 1 === 0
			? tick
			: '',
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

	.no-title {
		visibility: hidden;
	}
</style>


<div class="aggregate-data-container">
	{#each objectEntries($aggregatedDataMap ?? {}) as [ key, data ] }
		<ion-card class:has-graph={ data.chartCoordinates?.length > 1 }>
			<ion-card-header>
				<ion-card-title class:no-title={ data.title === '' }>{ data.title === '' ? 'no value' : data.title }</ion-card-title>

				<ion-card-subtitle>{ data.subtitle }</ion-card-subtitle>
			</ion-card-header>

			{#if data.chartCoordinates?.length > 1 }
				<ion-card-content>
					<ion-card-subtitle>{ data.chartLabel }</ion-card-subtitle>

					<LineGraph
						coordinates={ data.chartCoordinates }
						{ formatXTicks }
						formatYTicks={ formatYTicksMap[ key ] }
						hideYTicks={ key === 'erroredRate' }
					/>
				</ion-card-content>
			{/if}
		</ion-card>
	{/each}
</div>
