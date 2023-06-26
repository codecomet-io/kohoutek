<script
	lang="ts"
	context="module"
>
	import type { ColumnMap, Options } from '$types/data-table';
	import type { DataTable } from '$stores/data-table';

	import { roundToDecimals } from 'briznads-helpers';

	import Filters from '$components/DataTable/Filters.svelte';
	import AggregatedHeadlineData from '$components/DataTable/AggregatedHeadlineData.svelte';
	import ColumnChooser from '$components/DataTable/ColumnChooser.svelte';
	import Search from '$components/DataTable/Search.svelte';
	import HeaderRow from '$components/DataTable/HeaderRow.svelte';
	import Row from '$components/DataTable/Row.svelte';
</script>


<script lang="ts">
	export let searchParams  : URLSearchParams;
	export let storeInstance : DataTable;
	export let options       : Options;

	$: if (!storeInstance?.isInitialized) {
		storeInstance.init(options);
	}

	const {
		columnMap,
		visibleColumns,
		rows,
	} = storeInstance;

	function parseGridTemplateColumns(columnMap : ColumnMap, visibleColumns : string[]) : string {
		const totalColumnSpaces = visibleColumns
			.reduce((sum : number, key : string) => sum + (columnMap?.[ key ].size ?? 1), 0);

		const percentArr = visibleColumns
			.reduce((sum : string[], key : string) => {
				const percent = roundToDecimals(100 / totalColumnSpaces * (columnMap?.[ key ].size ?? 1), 3);

				sum.push(`${ percent }%`);

				return sum;
			}, []);

		return percentArr.join(' ');
	}
</script>


<style lang="scss">
	.table-wrapper {
		--border-color: #c8c7cc;

		--outer-border-width: 1px;
		--inner-border-width: 0.5px;

		--rounded-corner-radius: 8px;
	}

	.table-scroll-container {
		overflow-x: auto;
		margin-left: -16px;
		margin-right: -16px;
		padding-left: 16px;
		padding-right: 16px;
		padding-bottom: 16px;
	}

	.table-container {
		position: relative;
		width: fit-content;
		border-bottom-left-radius: var(--rounded-corner-radius);
		border-bottom-right-radius: var(--rounded-corner-radius);
		border: var(--outer-border-width) solid var(--border-color);
		box-shadow: var(--drop-shadow);

		@media (min-width: 768px) {
			width: 100%;
		}

		&.null-set {
			:global(.header.row) {
				border-bottom: none;
			}
		}
	}
</style>


<Filters
	{ searchParams }
	{ storeInstance }
/>

{#if Object.keys(storeInstance.opts.aggregatedHeadlineDataOptionsMap ?? {}).length > 0 }
	<AggregatedHeadlineData
		{ storeInstance }
	/>
{/if}

<div class="table-wrapper">
	<Search
		{ searchParams }
		{ storeInstance }
	/>

	<div class="table-scroll-container">
		<div
			class="table-container"
			class:null-set={ !($rows.length > 0) }
			style="--grid-template-columns:{ parseGridTemplateColumns($columnMap, $visibleColumns) };"
		>
			<ColumnChooser { storeInstance }/>

			<HeaderRow
				{ searchParams }
				{ storeInstance }
			/>

			{#each $rows as row, index }
				<Row
					{ storeInstance }
					{ row }
					let:key
					let:value
				>
					<slot
						name="cell"
						{ key }
						{ value }
						{ index }
					/>
				</Row>
			{/each}
		</div>
	</div>
</div>
