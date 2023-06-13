<script lang="ts">
	import type { DataTable } from '$lib/stores/data-table';

	import Sort from '$lib/components/DataTable/Sort.svelte';


	export let searchParams  : URLSearchParams;
	export let storeInstance : DataTable;

	const {
		columnMap,
		activeSort,
		visibleColumns,
	} = storeInstance;

	function updateFromParams(searchParams : URLSearchParams) : void {
		const key = searchParams.get('sort');
		const direction = searchParams.get('direction') as 'ascending' | 'descending';

		storeInstance.updateActiveSort(key ?? undefined, direction ?? undefined);
	}

	$: updateFromParams(searchParams);
</script>


<style lang="scss">
	.row {
		display: grid;
		grid-template-columns: var(--grid-template-columns);
		min-width: calc(768px - (16px * 2));
		align-items: center;
		font-weight: 700;
		border-bottom: var(--outer-border-width) solid var(--border-color);
	}

	.cell {
		display: flex;
		align-items: center;
		padding: 12px 0.25em 12px 1em;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;

		&:hover,
		&.active-sort {
			:global(.sort-button) {
				max-width: 22px;
				transition-delay: 0ms;
			}
		}

		&:hover:not(.active-sort) {
			:global(.sort-button) {
				opacity: 0.5;
			}
		}

		&.active-sort {
			:global(.sort-button) {
				opacity: 1;
			}
		}
	}

	.label {
		display: block;
		line-height: 22px;
		padding-right: 0.25em;
		flex-shrink: 1;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}
</style>


<div class="row header">
	{#each $visibleColumns as key }
		{@const column = $columnMap?.[ key ] }

		<div
			class="cell { key.replace('.', '-') }"
			class:visually-hidden={ column?.hiddenHeader === true }
			class:active-sort={ $activeSort.key === key }
			title={ column?.name }
		>
			<span class="label">{ column?.name }</span>

			{#if column?.hiddenHeader !== true }
				<Sort
					{ storeInstance }
					{ key }
				/>
			{/if}
		</div>
	{/each}
</div>
