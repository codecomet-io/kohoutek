<script
	lang="ts"
	context="module"
>
	import type { TrendData, TrendDirectionValue } from '$types/aggregated-headline-data';
	import type { DataTable } from '$stores/data-table';

	import { objectEntries } from 'briznads-helpers';

	import { arrowUp, arrowDown } from 'ionicons/icons';

	import LineGraph from '$components/LineGraph/component.svelte';
</script>


<script lang="ts">
	export let storeInstance : DataTable;

	const {
		aggregatedHeadlineDataMap,
		trendDataMap,
	} = storeInstance;

	function parseTrendBadgeColor(changePercent : number, direction : TrendDirectionValue) : 'success' | 'danger' | 'medium' {
		if (changePercent === 0 || direction === 'neutral') {
			return 'medium';
		} else if (changePercent > 0) {
			return direction === 'ascending'
				? 'success'
				: 'danger';
		} else {
			return direction === 'ascending'
				? 'danger'
				: 'success';
		}
	}

	function parseTrendBadgeTitle(label : string, currentTitle : string, trendData : TrendData) : string {
		let change : string;
		let previous : string;

		if ((trendData.changePercent ?? 0) === 0) {
			change = 'is flat';

			previous = '';
		} else {
			change = `represents a ${ Math.abs(trendData.changePercent ?? 0) }% ${ (trendData.changePercent ?? 0) > 0 ? 'increase' : 'decrease' }`;

			previous = `${ trendData.previousTitle } from `;
		}

		return `${ label } of ${ currentTitle } ${ change } compared to ${ previous }the equivalent previous period.`;
	}
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

		@media (min-width: 576px) {
			min-width: 40%;
		}

		@media (min-width: 992px) {
			min-width: auto;
		}
	}

	ion-card-title {
		display: inline-block;
	}

	.no-title {
		visibility: hidden;
	}

	ion-badge {
		margin-left: 0.5em;
	}

	ion-card-subtitle {
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
	}
</style>


{#if Object.keys($aggregatedHeadlineDataMap).length > 0 }
	<div class="aggregate-data-container">
		{#each objectEntries($aggregatedHeadlineDataMap) as [ key, value ] }
			{ @const trendData = $trendDataMap[ key ] }

			<ion-card>
				<ion-card-header>
					<div>
						<ion-card-title
							class:no-title={ !value.title }
						>
							{ value.title || 'no value' }
						</ion-card-title>

						{#if trendData?.changePercent != null }
							<ion-badge
								color={ parseTrendBadgeColor(trendData.changePercent, trendData.direction) }
								title={ parseTrendBadgeTitle(value.titleLabel, value.title ?? '', trendData) }
							>
								{ Math.abs(trendData.changePercent) }%

								{#if trendData.changePercent !== 0 }
									<ion-icon icon={ trendData.changePercent > 0 ? arrowUp : arrowDown }></ion-icon>
								{/if}
							</ion-badge>
						{/if}
					</div>

					<ion-card-subtitle>{ value.titleLabel }</ion-card-subtitle>
				</ion-card-header>

				<ion-card-content>
					{#if value.chartLabel }
						<ion-card-subtitle>{ value.chartLabel }</ion-card-subtitle>
					{/if}

					<LineGraph
						coordinates={ value.chartCoordinates ?? [] }
						xValueType={ value.xValueType }
						formatXValue={ value.formatXValue }
						formatYValue={ value.formatYValue }
						hideXTicks={ value.hideXTicks }
						hideYTicks={ value.hideYTicks }
						showTooltips={ value.showTooltips }
						timeFilterKey={ value.timeFilterKey }
					/>
				</ion-card-content>
			</ion-card>
		{/each}
	</div>
{/if }
