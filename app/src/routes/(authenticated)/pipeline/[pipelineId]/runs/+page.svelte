<script lang="ts">
	import type { AnyMap, QueryOptions } from 'briznads-helpers';

	import type { PageData } from './$types';
	import type { Run } from '../../../../../../../pantry/src/lib/model';

	import { get, getDateString, getTimeString, lapsed, isEmpty, removeEmptyItems, deepCopy, Query } from 'briznads-helpers';
	import { chevronForwardOutline, arrowUpOutline, filter, closeCircle } from 'ionicons/icons';

	import StatusIcon from '$lib/components/StatusIcon.svelte';


	type Column = {
		name : string;
		size? : number;
		showHeader? : boolean;
	};

	type AddFilterInfo = {
		key : string;
		finiteValues : false | string[];
		value? : any;
	};


	export let data : PageData;

	const columnMap : { [ key : string ] : Column } = {
		'status' : {
			name : 'Status',
			size : 0.5,
		},
		'name' : {
			name : 'Name',
			size : 2.5,
		},
		'started' : {
			name : 'Started',
		},
		'machineTime' : {
			name : 'Machine Time',
		},
		'actor.name' : {
			name : 'Actor Name',
		},
		'trigger' : {
			name : 'Trigger',
		},
		'erroredActionName' : {
			name : 'Errored Action',
			size : 2,
		},
		'link' : {
			name : 'Link',
			size : 0.3,
			showHeader : false,
		},
	};

	let activeSort : string = 'started';
	let sort : 'ascending' | 'descending' = 'descending';
	let runs : Run[];

	$: initRuns();

	function initRuns() : void {
		if (!data.runs) {
			return;
		}

		filterRuns(deepCopy(data.runs));
	}

	function filterRuns(possibleRuns? : Run[]) : void {
		let unfilteredRuns = possibleRuns ?? runs;

		if (!unfilteredRuns) {
			return;
		}

		for (const filter of filters) {
			const queryOptions : QueryOptions = finiteFilterValuesMap[ filter ]
				? {
					matchPartialWords   : false,
					disregardQueryOrder : false,
					caseInsensitive     : false,
				}
				: {
					matchPartialWords   : true,
					disregardQueryOrder : true,
					caseInsensitive     : true,
				};

			unfilteredRuns = Query.matchObject(
				unfilteredRuns,
				filterMap[ filter ],
				filter,
				queryOptions,
			);
		}

		sortRuns(unfilteredRuns);
	}

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

		const totalColumnSpaces = Object.values(columnMap)
			.reduce((total, column) => total + (column.size ?? 1), 0);

		for (const column of Object.values(columnMap)) {
			const percent = 100 / totalColumnSpaces * (column.size ?? 1);

			percentArr.push(`${ percent }%`);
		}

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

	function handleSortClick(name : string) : void {
		if (activeSort === name) {
			sort = sort === 'ascending' ? 'descending' : 'ascending';
		} else {
			activeSort = name;
			sort = 'ascending';
		}

		sortRuns();
	}

	let filterMap : AnyMap = {};
	let filters : string[] = [];

	let addFilterModalElement : HTMLIonModalElement;
	let addFilterInfo : undefined | AddFilterInfo;

	const finiteFilterValuesMap : { [ key : string ] : false | any[] } = {};

	function handleAddFilter(key : string) : void {
		addFilterInfo = parseAddFilterInfo(key);

		addFilterModalElement.present();
	}

	function parseAddFilterInfo(key : string) : AddFilterInfo {
		const finiteValues = parseFiniteFilterValues(key);

		return {
			key,
			finiteValues,
		};
	}

	function parseFiniteFilterValues(key : string) : false | string[] {
		let finiteValuesMap : { [ key : string ] : true } = {};

		for (const run of runs) {
			const value = get(run, key.split('.'));

			if (value == undefined) {
				continue;
			}

			finiteValuesMap[ value ] = true;

			if (Object.keys(finiteValuesMap).length > 10) {
				finiteValuesMap = {};

				break;
			}
		}

		let finiteValues : false | string[] = Object.keys(finiteValuesMap);

		if (finiteValues.length === 0) {
			finiteValues = false;
		}

		if (finiteValues) {
			finiteValues.sort();
		}

		finiteFilterValuesMap[ key ] = finiteValues;

		return finiteValues;
	}

	function handleCancelAddFilter() : void {
		addFilterInfo = undefined;

		addFilterModalElement.dismiss();
	}

	function handleFilterValueChange(event : any) : void {
		if (!addFilterInfo) {
			return;
		}

		addFilterInfo.value = event?.detail?.value;
	}

	function handleConfirmAddFilter() : void {
		if (!addFilterInfo) {
			return;
		}

		filterMap[ addFilterInfo.key ] = addFilterInfo.value;

		updateFilters();

		handleCancelAddFilter();

		filterRuns();
	}

	function updateFilters() : void {
		filterMap = filterMap;

		filters = removeEmptyItems(Object.keys(filterMap));
	}

	function handleRemoveFilter(key : string) : void {
		delete filterMap[ key ];

		updateFilters();

		initRuns();
	}
</script>


<style lang="scss">
	.filter-container {
		display: flex;
		align-items: center;
		margin-top: 10px;
		margin-bottom: 10px;

		:first-child {
			margin-left: 0;
		}
	}

	ion-modal {
		@media (min-width: 992px) {
			--width: calc(100% / 3);
			--height: calc(100% / 3);
		}
	}

	.table-wrapper {
		overflow-x: auto;
		margin-left: -16px;
		margin-right: -16px;
		padding-left: 16px;
		padding-right: 16px;
	}

	.row {
		display: grid;
		grid-template-columns: var(--grid-template-columns);
		min-width: 768px;
		align-items: center;
		border-bottom: 0.5px solid #c8c7cc;
	}

	.header {
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

			&.status {
				justify-content: start;

				@media (min-width: 768px) {
					padding-left: 0.5em;
				}
			}

			&.link {
				justify-content: end;
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


<ion-content
	class="ion-padding"
	fullscreen={ true }
	style='--grid-template-columns:{ parseGridTemplateColumns() };'
>
	<ion-card-subtitle>{ data.pipeline?.name ?? '' }</ion-card-subtitle>

	<ion-card-title>All Pipeline Runs</ion-card-title>

	<div class="filter-container">
		{#each filters as filterKey }
			<ion-chip
				on:click={ () => handleRemoveFilter(filterKey) }
				on:keydown={ () => handleRemoveFilter(filterKey) }
			>
				<ion-label><strong>{ columnMap[ filterKey ].name }:</strong> { filterMap[ filterKey ] }</ion-label>

				<ion-icon
					icon={ closeCircle }
					color="dark"
				></ion-icon>
			</ion-chip>
		{/each}

		<ion-button
			id="add-filter-popover-trigger"
			color="dark"
			size="small"
			fill="outline"
		>
			<ion-icon
				slot="start"
				size="small"
				icon={ filter }
			></ion-icon>

			Add Filter
		</ion-button>

		<ion-popover
			trigger="add-filter-popover-trigger"
			dismiss-on-select={ true }
		>
			<ion-content>
				<ion-list>
					{#each Object.entries(columnMap) as [ key, column ], index }
						<ion-item
							button={ true }
							detail={ false }
							lines={ index === Object.keys(columnMap).length - 1 ? 'none' : 'inset' }
							disabled={ filterMap[ key ] != null }
							on:click={ () => handleAddFilter(key)}
							on:keydown={ () => handleAddFilter(key)}
						>{ column.name }</ion-item>
					{/each }
				</ion-list>
			</ion-content>
		</ion-popover>

		<ion-modal bind:this={ addFilterModalElement }>
			{#if addFilterInfo?.key }
				<ion-header>
					<ion-toolbar>
						<ion-buttons slot="start">
							<ion-button
								on:click={ handleCancelAddFilter }
								on:keydown={ handleCancelAddFilter }
							>Cancel</ion-button>
						</ion-buttons>

						<ion-title>Filter By { columnMap[ addFilterInfo.key ].name }</ion-title>

						<ion-buttons slot="end">
							<ion-button
								strong={ true }
								disabled={ isEmpty(addFilterInfo.value, { includeEmptyString : true }) }
								on:click={ handleConfirmAddFilter }
								on:keydown={ handleConfirmAddFilter }
							>Confirm</ion-button>
						</ion-buttons>
					</ion-toolbar>
				</ion-header>

				<ion-content>
					{#if addFilterInfo.finiteValues }
						<ion-list>
							<ion-radio-group on:ionChange={ handleFilterValueChange }>
								{#each addFilterInfo.finiteValues as value }
									<ion-item>
										<ion-radio value={ value }>{ value }</ion-radio>
									</ion-item>
								{/each}
							</ion-radio-group>
						</ion-list>
					{:else}
						<ion-item>
							<ion-label position="stacked">Filter By Query</ion-label>

							<ion-input
								aria-label="Filter By Query"
								placeholder="Enter text"
								on:ionInput={ handleFilterValueChange }
							></ion-input>
						</ion-item>
					{/if}
				</ion-content>
			{/if}
		</ion-modal>
	</div>

	<div class="table-wrapper">
		<div class="row header">
			{#each Object.entries(columnMap) as [ key, column ] }
				<div
					class="cell { key.replace('.', '-') }"
					class:invisible={ column.showHeader === false }
					title={ column.name }
				>
					<span class="label">{ column.name }</span>

					<ion-button
						fill="clear"
						size="small"
						color="medium"
						class="sort-button"
						class:active={ activeSort === key }
						class:descending={ activeSort === key && sort === 'descending' }
						on:click={ () => handleSortClick(key) }
						on:keydown={ () => handleSortClick(key) }
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
				{#each Object.entries(columnMap) as [ key, column ] }
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
							{ getTimeString(value) }
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
</ion-content>
