<script
	lang="ts"
	context="module"
>
	import type { DataTable } from '$stores/data-table';

	import { get } from 'briznads-helpers';
</script>


<script lang="ts">
	export let storeInstance : DataTable;
	export let row           : any;

	const {
		visibleColumns,
		aggregatedColumnDataMap,
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
			// don't allow icons to expand row height
			padding-top: 0;
			padding-bottom: 0;
		}

		&.link {
			padding-left: 0;
			padding-right: 0.333em;
			justify-content: end;
			font-size: 24px;
		}

		&.number:first-child {
			overflow: visible;
		}

		&.best,
		&.worst {
			position: relative;

			&::after {
				content: '';
				position: absolute;
				top: 2px;
				right: 1.25px;
				bottom: 2px;
				left: 1.25px;
				z-index: -1;
			}
		}

		&.best::after {
			background-color: rgba(49, 197, 25, 0.13);

			@media (prefers-color-scheme: dark) {
				background-color: rgba(49, 197, 25, 0.4);
			}
		}

		&.worst::after {
			background-color: rgba(201, 23, 23, 0.1);

			@media (prefers-color-scheme: dark) {
				background-color: rgba(201, 23, 23, 0.5);
			}
		}
	}
</style>


<a
	class="row"
	href={ storeInstance.opts.parseRowLink(row) }
>
	{#each $visibleColumns as key }
		{@const value = get(row, key.split('.')) }
		{@const { best, worst } = $aggregatedColumnDataMap[ key ] ?? {} }

		<div
			class="cell { key.replace('.', '-') }"
			class:best={ best != null && best !== worst && value === best }
			class:worst={ worst != null && best !== worst && value === worst }
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
