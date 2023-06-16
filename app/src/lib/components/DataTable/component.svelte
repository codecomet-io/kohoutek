<script
	lang="ts"
	context="module"
>
	import type { ColumnMap, Options } from '$lib/types/data-table';
	import type { DataTable } from '$lib/stores/data-table';

	import Filters from '$lib/components/DataTable/Filters.svelte';
	import AggregatedHeadlineData from '$lib/components/DataTable/AggregatedHeadlineData.svelte';
	import ColumnChooser from '$lib/components/DataTable/ColumnChooser.svelte';
	import Search from '$lib/components/DataTable/Search.svelte';
	import HeaderRow from '$lib/components/DataTable/HeaderRow.svelte';
	import Row from '$lib/components/DataTable/Row.svelte';
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
				const percent = 100 / totalColumnSpaces * (columnMap?.[ key ].size ?? 1);

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
		margin-bottom: 70px;
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
	}
</style>


<Filters
	{ searchParams }
	{ storeInstance }
/>

{#if Object.keys(storeInstance.opts.aggregatedHeadlineDataOptionsMap ?? {}).length > 0 }
	<AggregatedHeadlineData
		{ storeInstance }
		let:key
		let:coordinates
	>
		<slot
			name="aggregatedChart"
			{ key }
			{ coordinates }
		/>
	</AggregatedHeadlineData>
{/if}

<div class="table-wrapper">
	<Search
		{ searchParams }
		{ storeInstance }
	/>

	<div class="table-scroll-container">
		<div
			class="table-container"
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
