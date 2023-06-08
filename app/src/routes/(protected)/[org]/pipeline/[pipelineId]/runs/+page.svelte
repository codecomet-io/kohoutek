<script lang="ts">
	import type { PageData } from './$types';
	import type { ColumnMap } from '$lib/types/runs-table';

	import { onMount } from 'svelte';
	import { get, getDateString, parseDate, getTimeString, lapsed } from 'briznads-helpers';
	import { chevronForwardOutline } from 'ionicons/icons';
	import { runsTable } from '$lib/stores/runs-table';

	import StatusIcon from '$lib/components/StatusIcon.svelte';
	import DataTableFilters from '$lib/components/DataTableFilters.svelte';
	import DataTableAggregatedData from '$lib/components/DataTableAggregatedData.svelte';
	import DataTableColumnChooser from '$lib/components/DataTableColumnChooser.svelte';
	import DataTableSearch from '$lib/components/DataTableSearch.svelte';
	import DataTableSort from '$lib/components/DataTableSort.svelte';


	export let data : PageData;

	$: if (data.runs) {
		if (!runsTable.isInitialized) {
			runsTable.init(initColumnMap, data.runs);
		}
	}

	const {
		columnMap,
		selectedColumns,
		activeSort,
		visibleColumns,
		runs,
	} = runsTable;

	function updateFromParams(searchParams : URLSearchParams) : void {
		const key = searchParams.get('sort');
		const direction = searchParams.get('direction') as 'ascending' | 'descending';

		runsTable.updateActiveSort(key ?? undefined, direction ?? undefined);
	}

	$: updateFromParams(data.searchParams);

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
		--border-color: #c8c7cc;

		--outer-border-width: 1px;
		--inner-border-width: 0.5px;

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
		border-color: var(--border-color);
		border-width: 0 var(--outer-border-width) var(--inner-border-width) var(--outer-border-width);

		&:last-child {
			border-bottom-width: var(--outer-border-width);
			border-bottom-left-radius: var(--rounded-corner-radius);
			border-bottom-right-radius: var(--rounded-corner-radius);
		}
	}

	.header {
		border-bottom-width: var(--outer-border-width);
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
						class:active-sort={ $activeSort.key === key }
						title={ column?.name }
					>
						<span class="label">{ column?.name }</span>

						{#if column?.hiddenHeader !== true }
							<DataTableSort { key } />
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
