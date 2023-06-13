<script lang="ts">
	import type { DataTable } from '$lib/stores/data-table';

	import { get } from 'briznads-helpers';


	export let storeInstance : DataTable;
	export let row           : any;


	const {
		visibleColumns,
	} = storeInstance;
</script>


<style lang="scss">
	.row {
		display: grid;
		grid-template-columns: var(--grid-template-columns);
		min-width: calc(768px - (16px * 2));
		align-items: center;
		position: relative;
		text-decoration: none;
		color: unset;

		&:not(:last-child) {
			border-bottom: var(--inner-border-width) solid var(--border-color);
		}

		&::after {
			inset: 0px;
			position: absolute;
			content: '';
			opacity: 0;
			transition: background-color 150ms linear, opacity 150ms linear;
			z-index: -1;
		}

		&:hover,
		&:focus {
			&::after {
				background-color: #000;
				opacity: 0.04;
			}
		}
	}

	.cell {
		padding: 12px 1em;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;

		&.status,
		&.link {
			display: flex;
		}

		&.link {
			padding-left: 0;
			padding-right: 0.333em;
			justify-content: end;
			font-size: 24px;
		}
	}
</style>


<a
	class="row"
	href={ storeInstance.opts.parseRowLink(row) }
>
	{#each $visibleColumns as key }
		{@const value = get(row, key.split('.')) }

		<div
			class="cell { key.replace('.', '-') }"
			title={ storeInstance.opts.parseCellTitle(key, value) }
		>
			{#if $$slots.default }
				<slot
					{ key }
					{ value }
				/>
			{:else }
				{ value ?? '' }
			{/if }
		</div>
	{/each}
</a>
