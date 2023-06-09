<script lang="ts">
	import type { AlertInput } from '@ionic/core';
	import type { BooleanMap, ValueOf } from 'briznads-helpers';

	import type { FilterMap, StartedFilterValue } from '$lib/types/runs-table';

	import { onMount } from 'svelte';
	import { snakeCase, camelCase } from 'lodash';
	import { lapsed, objectEntries } from 'briznads-helpers';
	import { filter as filterIcon, closeCircle, chevronDown } from 'ionicons/icons';
	import { HEK, getEndpoints, gotoSearchString } from '$lib/helper';
	import { runsTable } from '$lib/stores/runs-table';


	export let searchParams : URLSearchParams;

	const {
		columnMap,
		filterMap,
		addFilterInfo,
		runs,
		finiteFilterValuesMap,
		filterableColumns,
	} = runsTable;

	const filterParamRegex = /^filter__/;

	function updateFromParams(searchParams : URLSearchParams) : void {
		const filterParams : FilterMap = {};

		for (const [ key, value ] of searchParams) {
			if (!filterParamRegex.test(key)) {
				continue;
			}

			const parsedKey = camelCase(key.replace(filterParamRegex, ''));
			const parsedValues = JSON.parse(value);

			filterParams[ parsedKey ] = parsedValues;
		}

		if (!filterParams.started) {
			filterParams.started = [ 'last 30 days' ];
		}

		runsTable.updateFilterMap(filterParams);

		chipClickedMap = {};
	}

	$: updateFromParams(searchParams);

	let addFilterAlertElement : HTMLIonAlertElement;

	onMount(() => {
		addFilterAlertElement.header = 'Add Filter';

		addFilterAlertElement.buttons = [
			{
				text: 'Cancel',
				role: 'cancel',
			},
			{
				text: 'OK',
				role: 'confirm',
			},
		];
	});

	function resetAddFilterAlert() : void {
		addFilterAlertElement.subHeader = undefined;
		addFilterAlertElement.message = undefined;
		addFilterAlertElement.inputs = [];
	}

	function populateMachineTimeAddFilterAlert() : void {
		const { lower, upper } = getEndpoints($runs, 'machineTime', true);

		addFilterAlertElement.message = `
			<p>${ parseMachineTime(lower) } - ${ parseMachineTime(upper) }</p>

			<ion-range
				id="durationRangeSlider"
				aria-label="Volume"
				dual-knobs="true"
			></ion-range>
		`;

		setTimeout(() => {
			const durationRangeSlider = document.querySelector('#durationRangeSlider') as HTMLIonRangeElement;

			if (!durationRangeSlider) {
				return;
			}

			durationRangeSlider.dualKnobs = true;

			durationRangeSlider.max = upper;
			durationRangeSlider.min = lower;

			durationRangeSlider.value = {
				lower,
				upper,
			};

			durationRangeSlider.pin = true;

			durationRangeSlider.pinFormatter = parseMachineTime;

			durationRangeSlider.addEventListener(
				'ionChange',
				handleDurationRangeChange,
				false,
			);
		}, 10);
	}

	function handleDurationRangeChange(event : any) : void {
		const { lower, upper } = event?.detail?.value;

		addFilterInfo.update(item => {
			item.value = [ lower, upper ];

			return item;
		});
	}

	function getFilterChipValue(key : keyof FilterMap, values : ValueOf<FilterMap>) : string {
		if (values == null) {
			values = [];
		}

		return key === 'machineTime'
			? `${ parseMachineTime(values[0]) } - ${ parseMachineTime(values[1]) }`
			: values.join(', ');
	}

	function parseMachineTime(value : number) : string {
		return lapsed(value, true);
	}

	function handleAddFilter(key : string) : void {
		setAddFilterInfo(key);

		populateAddFilterAlert();

		addFilterAlertElement.present();
	}

	function setAddFilterInfo(key : string) : void {
		addFilterInfo.set({
			key,
			finiteValues : $finiteFilterValuesMap[ key ] ?? false,
		});
	}

	function populateAddFilterAlert() : void {
		resetAddFilterAlert();

		const { key } = $addFilterInfo;

		addFilterAlertElement.subHeader = `Filter By ${ $columnMap?.[ key ].name }`;

		if (key === 'machineTime') {
			populateMachineTimeAddFilterAlert();
		} else {
			addFilterAlertElement.inputs = parseAddFilterAlertInputs();
		}
	}

	function parseAddFilterAlertInputs() : AlertInput[] {
		const finiteValues = $addFilterInfo.finiteValues;

		if (!finiteValues) {
			return [];
		}

		return finiteValues.map((value) => ({
			value,
			label : value,
			type  : 'checkbox',
		}));
	}

	function handleDismissAddFilterAlert(event : any) : void {
		if (event?.detail?.role !== 'confirm') {
			return;
		}

		const { key, value } = $addFilterInfo;

		const values = key === 'machineTime'
			? value
			: event?.detail?.data?.values ?? [];

		if (!values.join('').trim()) {
			return;
		}

		updateFilter(key, values);
	}

	function updateFilter(key : keyof FilterMap, values? : any[]) : void {
		const paramKey = `filter__${ snakeCase(key) }`;

		let paramValues : undefined | string = undefined;

		if (values) {
			paramValues = JSON.stringify(values);
		}

		gotoSearchString(paramKey, paramValues);
	}

	let chipClickedMap : BooleanMap = {};

	function handleChipClick(key : keyof FilterMap) : void {
		chipClickedMap[ key ] = true;

		updateFilter(key);
	}

	const startedFilterOptions : StartedFilterValue[] = [
		'last 24 hours',
		'last 3 days',
		'last 7 days',
		'last 30 days',
		'last 90 days',
	];

	function handleAddStartedFilter(option : StartedFilterValue) : void {
		console.debug('handleAddStartedFilter', option);
	}
</script>


<style lang="scss">
	.filter-container {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
		margin-top: 20px;
		margin-bottom: 20px;

		:first-child {
			margin-left: 0;
		}

		ion-button,
		ion-chip {
			margin: 0;
			box-shadow: rgba(0, 0, 0, 0.12) 0px 4px 16px;
		}
	}

	.add-filter-popover-trigger {
		min-height: 32px;
		border-radius: 6px;
	}
</style>


<div class="filter-container">
	{#if $filterMap.started }
		<ion-chip
			id="startedPopoverTrigger"
			disabled={ chipClickedMap.started }
		>
			<ion-label><strong>{ $columnMap?.started.name }:</strong> { getFilterChipValue('started', $filterMap.started) }</ion-label>

			<ion-icon
				icon={ chevronDown }
				color="dark"
			></ion-icon>
		</ion-chip>

		<ion-popover
			trigger="startedPopoverTrigger"
			dismiss-on-select={ true }
		>
			<ion-content>
				<ion-list>
					{#each startedFilterOptions as option, index }
						<ion-item
							button={ true }
							detail={ false }
							disabled={ $filterMap.started?.[0] === option }
							lines={ index === startedFilterOptions.length - 1 ? 'none' : 'inset' }
							on:click={ () => handleAddStartedFilter(option)}
							on:keydown={ (e) => HEK(e, () => handleAddStartedFilter(option)) }
						>{ option }</ion-item>
					{/each }
				</ion-list>
			</ion-content>
		</ion-popover>
	{/if }

	{#each objectEntries($filterMap) as [ key, values ] }
		{#if key !== 'started' }
			<ion-chip
				on:click={ () => handleChipClick(key) }
				on:keydown={ (e) => HEK(e, () => handleChipClick(key)) }
				disabled={ chipClickedMap[ key ] }
			>
				<ion-label><strong>{ $columnMap?.[ key ].name }:</strong> { getFilterChipValue(key, values) }</ion-label>

				<ion-icon
					icon={ closeCircle }
					color="dark"
				></ion-icon>
			</ion-chip>
		{/if }
	{/each}

	<ion-button
		class="add-filter-popover-trigger"
		id="addFilterPopoverTrigger"
		color="dark"
		size="small"
		fill="outline"
	>
		<ion-icon
			slot="start"
			size="small"
			icon={ filterIcon }
		></ion-icon>

		Add Filter
	</ion-button>

	<ion-popover
		trigger="addFilterPopoverTrigger"
		dismiss-on-select={ true }
	>
		<ion-content>
			<ion-list>
				{#each $filterableColumns as key, index }
					<ion-item
						button={ true }
						detail={ false }
						lines={ index === $filterableColumns.length - 1 ? 'none' : 'inset' }
						disabled={ $filterMap[ key ] != null }
						on:click={ () => handleAddFilter(key)}
						on:keydown={ (e) => HEK(e, () => handleAddFilter(key)) }
					>{ $columnMap?.[ key ].name }</ion-item>
				{/each }
			</ion-list>
		</ion-content>
	</ion-popover>
</div>

<ion-alert
	bind:this={ addFilterAlertElement }
	on:didDismiss={ handleDismissAddFilterAlert }
></ion-alert>
