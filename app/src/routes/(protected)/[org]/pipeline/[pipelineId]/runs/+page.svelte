<script lang="ts">
	import type { PageData } from './$types';
	import type { ColumnMap } from '$lib/types/runs-table';

	import { onMount, onDestroy } from 'svelte';
	import { get, getDateString, parseDate, getTimeString, lapsed } from 'briznads-helpers';
	import { chevronForwardOutline, arrowUpOutline } from 'ionicons/icons';
	import { HEK } from '$lib/helper';
	import { runsTable } from '$lib/stores/runs-table';

	import StatusIcon from '$lib/components/StatusIcon.svelte';
	import DataTableFilters from '$lib/components/DataTableFilters.svelte';
	import DataTableAggregatedData from '$lib/components/DataTableAggregatedData.svelte';
	import DataTableColumnChooser from '$lib/components/DataTableColumnChooser.svelte';
	import DataTableSearch from '$lib/components/DataTableSearch.svelte';


	export let data : PageData;

	const initColumnMap : ColumnMap = {
		'status' : {
			name : 'Status',
			size : 0.5,
		},
		'name' : {
			name         : 'Name',
			size         : 2.5,
			unfilterable : true,
		},
		'started' : {
			name         : 'Started',
			unfilterable : true,
		},
		'machineTime' : {
			name : 'Duration',
		},
		'actor.name' : {
			name : 'Actor Name',
		},
		'trigger' : {
			name : 'Trigger',
		},
		'erroredActionName' : {
			name            : 'Errored Action',
			size            : 2,
			initiallyHidden : true,
		},
		'link' : {
			name         : 'Link',
			size         : 0.3,
			hiddenHeader : true,
			unfilterable : true,
			unhideable   : true,
		},
	};

	$: if (data.runs) {
		if (!runsTable.isInitialized) {
			runsTable.init(initColumnMap, data.runs);
		}
	}

	const {
		columnMap,
		selectedColumns,
		activeSort,
		selectableColumns,
		visibleColumns,
		runs,
	} = runsTable;

	const localStorageKey = 'pipelineRunsColumns';

	let storedColumnsStr : string | null;

	function initStoredColumns() : void {
		storedColumnsStr = window.localStorage.getItem(localStorageKey);

		runsTable.initStoredColumns(storedColumnsStr);
	}

	onMount(initStoredColumns);

	function updateStoredColumns(columns : string[]) : void {
		if (storedColumnsStr === undefined || columns.length === 0) {
			return;
		}

		window.localStorage.setItem(localStorageKey, JSON.stringify(columns));
	}

	$: updateStoredColumns($selectedColumns);

	function parseGridTemplateColumns(visibleColumns : string[]) : string {
		const totalColumnSpaces = visibleColumns
			.reduce((sum : number, key : string) => sum + ($columnMap?.[ key ].size ?? 1), 0);

		const percentArr = visibleColumns
			.reduce((sum : string[], key : string) => {
				const percent = 100 / totalColumnSpaces * ($columnMap?.[ key ].size ?? 1);

				sum.push(`${ percent }%`);

				return sum;
			}, []);

		return percentArr.join(' ');
	}

	function parseCellTitle(key : string, value : any) : string {
		let parsedValue = value?.toString();

		if (key === 'started') {
			parsedValue = getDateString(value);
		} else if (key === 'machineTime') {
			parsedValue += ` millisecond${ value === 1 ? '' : 's' }`;
		} else if (key === 'link') {
			parsedValue = 'View Run';
		}

		return parsedValue;
	}

	function parseStartedValue(value : number) : string {
		const dateObj = parseDate(value);
		const ago = Date.now() - value;

		// if more than a day ago, show date and time
		return ago > 86400000
			? dateObj.toLocaleString(undefined, { dateStyle:'short', timeStyle:'short'})
			: getTimeString(dateObj);
	}
</script>


<style lang="scss">
	.table-scroll-container {
		--rounded-corner-radius: 8px;

		overflow-x: auto;
		margin-left: -16px;
		margin-right: -16px;
		padding-left: 16px;
		padding-right: 16px;
		padding-bottom: 16px;
	}

	.table-wrapper {
		position: relative;
		width: fit-content;

		@media (min-width: 768px) {
			width: 100%;
		}
	}

	.row {
		display: grid;
		grid-template-columns: var(--grid-template-columns);
		min-width: calc(768px - (16px * 2));
		align-items: center;
		border-style: solid;
		border-color: #c8c7cc;
		border-width: 0 0.5px 0.5px 0.5px;

		&:last-child {
			border-bottom-left-radius: var(--rounded-corner-radius);
			border-bottom-right-radius: var(--rounded-corner-radius);
		}
	}

	.header {
		border-top-width: 0.5px;
		font-weight: 700;

		.cell {
			display: flex;
			align-items: center;
			padding-right: 0.25em;
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
	}

	.sort-button {
		--padding-start: 0;
		--padding-end: 0;

		height: 22px;
		width: 22px;
		margin: 0;
		flex-grow: 0;
		flex-shrink: 0;
		opacity: 0;
		max-width: 0;
		transform-origin: center;
		transition-property: max-width, transform, opacity;
		transition-duration: 0ms, 250ms, 250ms;
		transition-delay: 250ms, 250ms, 0ms;
		transition-timing-function: linear;

		.cell:hover &,
		&.active {
			max-width: 22px;
			transition-delay: 0ms;
		}

		.cell:hover &:not(.active) {
			opacity: 0.5;
		}

		&.active {
			opacity: 1;
		}

		&.descending {
			transform: rotate(180deg);
			transition-delay: 0ms;
		}
	}

	a.row {
		position: relative;
		text-decoration: none;
		color: unset;

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

		.cell {
			&.status,
			&.link {
				display: flex;
			}

			&.link {
				padding-left: 0;
				padding-right: 0.333em;
				justify-content: end;
			}
		}
	}

	.cell {
		padding: 12px 1em;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	ion-icon {
		font-size: 25px;
	}
</style>


<ion-content
	class="ion-padding"
	fullscreen={ true }
	style='--grid-template-columns:{ parseGridTemplateColumns($visibleColumns) };'
>
	<ion-card-subtitle>{ data.pipeline?.name ?? '' }</ion-card-subtitle>

	<ion-card-title>All Pipeline Runs</ion-card-title>

	<DataTableFilters searchParams={ data.searchParams } />

	<DataTableAggregatedData />

	<div class="table-scroll-container">
		<DataTableSearch searchParams={ data.searchParams } />

		<div class="table-wrapper">
			<DataTableColumnChooser />

			<div class="row header">
				{#each $visibleColumns as key }
					{@const column = $columnMap?.[ key ] }

					<div
						class="cell { key.replace('.', '-') }"
						class:visually-hidden={ column?.hiddenHeader === true }
						title={ column?.name }
					>
						<span class="label">{ column?.name }</span>

						{#if column?.hiddenHeader !== true }
							<ion-button
								fill="clear"
								size="small"
								color="medium"
								class="sort-button"
								class:active={ $activeSort.key === key }
								class:descending={ $activeSort.key === key && $activeSort.direction === 'descending' }
								on:click={ () => runsTable.updateActiveSort(key) }
								on:keydown={ (e) => HEK(e, () => runsTable.updateActiveSort(key)) }
							>
								<ion-icon
									slot="icon-only"
									icon={ arrowUpOutline }
								></ion-icon>
							</ion-button>
						{/if}
					</div>
				{/each}
			</div>

			{#each $runs as run }
				<a
					class="row"
					href="/{ data.org }/run/{ run.id }"
				>
					{#each $visibleColumns as key }
						{@const value = get(run, key.split('.')) }

						<div
							class="cell { key.replace('.', '-') }"
							title={ parseCellTitle(key, value) }
						>
							{#if key === 'status' }
								<StatusIcon
									size="small"
									status={ value }
								/>
							{:else if key === 'started' }
								{ parseStartedValue(value) }
							{:else if key === 'machineTime' }
								{ lapsed(value, true) }
							{:else if key === 'link' }
								<ion-icon
									icon={ chevronForwardOutline }
									color="medium"
								></ion-icon>
							{:else}
								{ value ?? '' }
							{/if}
						</div>
					{/each}
				</a>
			{/each}
		</div>
	</div>
</ion-content>
