<script lang="ts">
	import type { ColumnMap, ParseRowLinkFunc, ParseCellTitleFunc, Options } from '$lib/types/data-table';
	import type { DataTable } from '$lib/stores/data-table';

	import DataTableFilters from '$lib/components/DataTableFilters.svelte';
	import DataTableAggregatedData from '$lib/components/DataTableAggregatedData.svelte';
	import DataTableColumnChooser from '$lib/components/DataTableColumnChooser.svelte';
	import DataTableSearch from '$lib/components/DataTableSearch.svelte';
	import DataTableHeaderRow from '$lib/components/DataTableHeaderRow.svelte';
	import DataTableRow from '$lib/components/DataTableRow.svelte';


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
	.table-scroll-container {
		--border-color: #c8c7cc;

		--outer-border-width: 1px;
		--inner-border-width: 0.5px;

		--rounded-corner-radius: 8px;

		overflow-x: auto;
		margin-left: -16px;
		margin-right: -16px;
		margin-bottom: 70px;
		padding-left: 16px;
		padding-right: 16px;
		padding-bottom: 16px;
	}

	.table-wrapper {
		position: relative;
		width: fit-content;
		box-shadow: rgba(0, 0, 0, 0.12) 0px 4px 16px;
		border-bottom-left-radius: var(--rounded-corner-radius);
		border-bottom-right-radius: var(--rounded-corner-radius);
		border: var(--outer-border-width) solid var(--border-color);

		@media (min-width: 768px) {
			width: 100%;
		}
	}
</style>


<DataTableFilters
	{ searchParams }
	{ storeInstance }
/>

{#if storeInstance.opts.includeAggregatedData !== false }
	<DataTableAggregatedData />
{/if}

<div class="table-scroll-container">
	<DataTableSearch
		{ searchParams }
		{ storeInstance }
	/>

	<div
		class="table-wrapper"
		style="--grid-template-columns:{ parseGridTemplateColumns($columnMap, $visibleColumns) };"
	>
		<DataTableColumnChooser { storeInstance }/>

		<DataTableHeaderRow
			{ searchParams }
			{ storeInstance }
		/>

		{#each $rows as row }
			<DataTableRow
				{ storeInstance }
				{ row }
				let:key
				let:value
			>
				<slot
					name="cell"
					{ key }
					{ value }
				/>
			</DataTableRow>
		{/each}
	</div>
</div>
