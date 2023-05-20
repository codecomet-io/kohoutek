<script lang="ts">
	import type { PageData } from './$types';
	import type { Run } from '../../../../../../../pantry/src/lib/model';

	import { get, getDateString, getTimeString, lapsed } from 'briznads-helpers';
	import { chevronForwardOutline, arrowUpOutline } from 'ionicons/icons';

	import StatusIcon from '$lib/components/StatusIcon.svelte';
	import Ago from '$lib/components/Ago.svelte';


	type Column = {
		name : string;
		size? : number;
		showHeader? : boolean;
	};


	export let data : PageData;

	$: sortRuns(data.runs);

	const columns : Column[] = [
		{
			name : 'status',
			size : 0.5,
		},
		{
			name : 'name',
			size : 2.5,
		},
		{
			name : 'started',
		},
		{
			name : 'machineTime',
		},
		{
			name : 'actor.name',
		},
		{
			name : 'trigger',
		},
		{
			name : 'erroredActionName',
			size : 2,
		},
		{
			name : 'link',
			size : 0.3,
			showHeader : false,
		},
	];

	let activeSort : string = 'started';
	let sort : 'ascending' | 'descending' = 'descending';
	let runs : Run[];

	function sortRuns(possibleRuns? : Run[]) : void {
		const unsortedRuns = possibleRuns ?? runs;

		if (!unsortedRuns) {
			return;
		}

		unsortedRuns.sort(doSortRun);

		runs = unsortedRuns;
	}

	function doSortRun(a : Run, b : Run) : number {
		const aValue = getSortValue(a);
		const bValue = getSortValue(b);

		if (aValue > bValue) {
			return sort === 'ascending'
				? 1
				: -1;
		}

		if (aValue < bValue) {
			return sort === 'ascending'
				? -1
				: 1;
		}

		return 0;
	}

	function getSortValue(run : Run) : any {
		let value = get(run, activeSort.split('.'));

		if (value == undefined) {
			value = '';
		} else if (typeof value === 'string') {
			value = value.toLowerCase();
		}

		return value;
	}

	function parseGridTemplateColumns() : string {
		const percentArr = [];

		const totalColumnSpaces = columns.reduce((total, column) => total + (column.size ?? 1), 0);

		for (const column of columns) {
			const percent = 100 / totalColumnSpaces * (column.size ?? 1);

			percentArr.push(`${ percent }%`);
		}

		return percentArr.join(' ');
	}

	function parseCellTitle(column : Column, value : any) : string {
		let parsedValue = value?.toString();

		if (column.name === 'started') {
			parsedValue = getDateString(value);
		} else if (column.name === 'machineTime') {
			parsedValue += ` millisecond${ value === 1 ? '' : 's' }`;
		} else if (column.name === 'link') {
			parsedValue = 'View Run';
		}

		return parsedValue;
	}

	function handleSortClick(name : string) : void {
		if (activeSort === name) {
			sort = sort === 'ascending' ? 'descending' : 'ascending';
		} else {
			activeSort = name;
			sort = 'ascending';
		}

		sortRuns();
	}
</script>


<style lang="scss">
	.table-container {
		padding: 20px;
	}

	.row {
		display: grid;
		grid-template-columns: var(--grid-template-columns);
		align-items: center;
		border-bottom: 0.5px solid #c8c7cc;
	}

	.header {
		margin-top: 20px;
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
				justify-content: center;
			}
		}
	}

	.cell {
		padding: 0.5em;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;

		&:first-child {
			padding-left: 0;
		}

		&:last-child {
			padding-right: 0;
		}

		&.invisible {
			visibility: hidden;
		}
	}

	ion-icon {
		font-size: 25px;
	}
</style>


<div
	class="table-container"
	style='--grid-template-columns:{ parseGridTemplateColumns() };'
>
	<ion-card-subtitle>{ data.pipeline?.name ?? '' }</ion-card-subtitle>

	<ion-card-title>All Pipeline Runs</ion-card-title>

  <div class="row header">
		{#each columns as column }
			<div
				class="cell { column.name.replace('.', '-') }"
				class:invisible={ column.showHeader === false }
				title={ column.name }
			>
				<span class="label">{ column.name }</span>

				<ion-button
					fill="clear"
					size="small"
					color="medium"
					class="sort-button"
					class:active={ activeSort === column.name }
					class:descending={ activeSort === column.name && sort === 'descending' }
					on:click={ () => handleSortClick(column.name) }
					on:keydown={ () => handleSortClick(column.name) }
				>
					<ion-icon
						slot="icon-only"
						icon={ arrowUpOutline }
					></ion-icon>
				</ion-button>
			</div>
		{/each}
	</div>

	{#each runs ?? [] as run }
		<a
			class="row"
			href="/run/{ run.id }"
		>
			{#each columns as column }
				{@const value = get(run, column.name.split('.')) }

				<div
					class="cell { column.name.replace('.', '-') }"
					title={ parseCellTitle(column, value) }
				>
					{#if column.name === 'status' }
						<StatusIcon
							size="small"
							status={ run[ column.name ] }
						/>
					{:else if column.name === 'started' }
						{ getTimeString(value) }
					{:else if column.name === 'machineTime' }
						{ lapsed(value, true) }
					{:else if column.name === 'link' }
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
