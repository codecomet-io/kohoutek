<script
	lang="ts"
	context="module"
>
	import type { AlertInput, DatetimeCustomEvent } from '@ionic/core';
	import type { BooleanMap, ValueOf } from 'briznads-helpers';

	import type { FilterMap, TimeFilterNamedValue, AddFilterInfo } from '$lib/types/data-table';

	import type { DataTable } from '$lib/stores/data-table';

	import { onMount } from 'svelte';
	import { sleep, objectEntries, parseDate, isInvalidDate } from 'briznads-helpers';
	import { filter as filterIcon, closeCircle, chevronDown } from 'ionicons/icons';
	import { HEK, getEndpoints, gotoSearchString } from '$lib/helper';
</script>


<script lang="ts">
	export let searchParams  : URLSearchParams;
	export let storeInstance : DataTable;

	const {
		columnMap,
		filterMap,
		addFilterInfo,
		rows,
		finiteFilterValuesMap,
		filterableColumns,
		selectableFilters,
	} = storeInstance;

	const filterParamRegex = /^filter_/;

	function updateFromParams(searchParams : URLSearchParams) : void {
		const filterParams : FilterMap = {};

		for (const [ key, value ] of searchParams) {
			if (!filterParamRegex.test(key)) {
				continue;
			}

			const parsedKey = key.replace(filterParamRegex, '');
			const parsedValues = JSON.parse(value);

			filterParams[ parsedKey ] = parsedValues;
		}

		storeInstance.updateFilterMap(filterParams);

		chipClickedMap = {};
	}

	$: updateFromParams(searchParams);

	let alertElement : HTMLIonAlertElement;

	function populateAddFilterAlertSkeleton() : void {
		alertElement.header = 'Add Filter';

		alertElement.buttons = [
			{
				text: 'Cancel',
				role: 'cancel',
			},
			{
				text: 'OK',
				role: 'confirm',
			},
		];
	}

	onMount(populateAddFilterAlertSkeleton);

	let alertMessageElement : HTMLElement;

	function initAlertMessageElement() : void {
		alertMessageElement = alertElement.querySelector('.alert-message') as HTMLElement;
	}

	async function resetAddFilterAlert() : Promise<void> {
		alertElement.subHeader = undefined;
		alertElement.inputs = [];

		if (!alertMessageElement) {
			await sleep(10);

			initAlertMessageElement();
		}

		alertMessageElement.innerHTML = '';
	}

	async function parseAddNumericFilterAlertInputs(key : string) : Promise<void> {
		const { lower, upper } = getEndpoints($rows, key, true);

		alertMessageElement.innerHTML = `
			<p>${ storeInstance.parseDisplayValue(key, lower) } - ${ storeInstance.parseDisplayValue(key, upper) }</p>

			<ion-range
				id="durationRangeSlider"
				aria-label="${ $columnMap?.[ key ].name } range"
				dual-knobs="true"
			></ion-range>
		`;

		// wait a beat to insure range slider is selectable in the DOM
		await sleep(10);

		const rangeSlider = document.querySelector('#durationRangeSlider') as HTMLIonRangeElement;

		if (!rangeSlider) {
			return;
		}

		rangeSlider.dualKnobs = true;

		rangeSlider.max = upper;
		rangeSlider.min = lower;

		rangeSlider.value = {
			lower,
			upper,
		};

		rangeSlider.pin = true;

		rangeSlider.pinFormatter = storeInstance.getDisplayValueFunction(key);
	}

	function updateRange(timeRange : { lower? : number, upper? : number }) : void {
		const { lower, upper } = timeRange ?? {};

		if (lower == null && upper == null) {
			return;
		}

		addFilterInfo.update(item => {
			if (item.value == null) {
				item.value = {};
			}

			if (lower != null) {
				item.value.lower = lower;
			}

			if (upper != null) {
				item.value.upper = upper;
			}

			return item;
		});
	}

	function getFilterChipValue(key : keyof FilterMap, values : ValueOf<FilterMap>) : string {
		if (values == null) {
			values = [];
		}

		return values.length > 1 && typeof values[0] === 'number'
			? `${ storeInstance.parseDisplayValue(key as string, values[0]) } - ${ storeInstance.parseDisplayValue(key as string, values[1]) }`
			: values.join(', ');
	}

	async function handleAddFilter(key : string) : Promise<void> {
		setAddFilterInfo(key);

		await populateAddFilterAlert();

		alertElement.present();
	}

	function setAddFilterInfo(key : string) : void {
		const info : AddFilterInfo = {
			key,
			finiteValues : $finiteFilterValuesMap[ key ] ?? false,
		};

		if ($filterMap?.[ key ] && $columnMap?.[ key ]?.type !== 'string') {
			const [ lower, upper ] = $filterMap?.[ key ] ?? [];

			if (lower != null || upper != null) {
				info.value = {};

				if (lower != null) {
					info.value.lower = lower;
				}

				if (upper != null) {
					info.value.upper = upper;
				}
			}
		}

		addFilterInfo.set(info);
	}

	async function populateAddFilterAlert() : Promise<void> {
		await resetAddFilterAlert();

		const { key } = $addFilterInfo;

		alertElement.subHeader = `Filter By ${ $columnMap?.[ key ].name }`;

		const type = $columnMap?.[ key ]?.type;

		if (type === 'datetime') {
			parseAddDateTimeFilterAlertInputs(key);
		} else if (type === 'string') {
			parseAddStringFilterAlertInputs();
		} else {
			parseAddNumericFilterAlertInputs(key);
		}
	}

	function parseAddDateTimeFilterAlertInputs(key : string) : void {
		alertMessageElement.innerHTML = `
			<ion-list class="time-filter-alert-list">
				<ion-item class="lower-value">
					<ion-label>
						<ion-card-subtitle>Starting</ion-card-subtitle>

						<ion-button
							fill="outline"
							data-bound="lower"
						>Select Starting Date</ion-button>

						<ion-datetime-button datetime="datetimeLower"></ion-datetime-button>
					</ion-label>
				</ion-item>

				<ion-item
					class="upper-value"
					lines="none"
				>
					<ion-label>
						<ion-card-subtitle>Ending</ion-card-subtitle>

						<ion-button
							fill="outline"
							data-bound="upper"
						>Select Ending Date</ion-button>

						<ion-datetime-button datetime="datetimeUpper"></ion-datetime-button>
					</ion-label>
				</ion-item>
			</ion-list>
		`;
	}

	function parseAddStringFilterAlertInputs() : void {
		const finiteValues = $addFilterInfo.finiteValues;

		let inputs : AlertInput[] = [];

		if (finiteValues) {
			inputs = finiteValues.map((value) => ({
				value,
				label : value,
				type  : 'checkbox',
			}));
		}

		alertElement.inputs = inputs;
	}

	function handleDismissAddFilterAlert(event : any) : void {
		if (event?.detail?.role !== 'confirm') {
			return;
		}

		const { key, value } = $addFilterInfo;
		const { lower, upper } = value ?? {};

		const values = $columnMap?.[ key ].type === 'string'
			? event?.detail?.data?.values ?? []
			: [ lower, upper ];

		if (!(values ?? []).join('').trim()) {
			return;
		}

		updateFilter(key, values);
	}

	function updateFilter(key : keyof FilterMap, values? : any[]) : void {
		const paramKey = `filter_${ key }`;

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

	function handleUpdateTimeFilter(key : string, option : TimeFilterNamedValue) : void {
		updateFilter(key, [ option ]);
	}

	function handleDatetimeModalWillPresent() : void {
		alertElement.dismiss(null, 'cancel');
	}

	function handleDatetimeModalWillDismiss() : void {
		alertElement.present();
	}

	function handleDatetimeChange(event : DatetimeCustomEvent) : void {
		const key = event.target?.name === 'lower'
			? 'lower'
			: 'upper';

		const values : { upper? : number, lower? : number } = {};
		const value : string = event?.detail?.value as string ?? '';

		if (!(value && typeof value === 'string')) {
			return;
		}

		const date = new Date(value);
		const epoch = date?.getTime();

		values[ key ] = epoch;

		updateRange(values);
	}

	function parseISODate(addFilterInfo : AddFilterInfo, bound : 'lower' | 'upper') : string | undefined {
		const type = $columnMap?.[ addFilterInfo.key ]?.type;

		if (type !== 'datetime') {
			return undefined;
		}

		const epoch = getAddFilterNumericValue(addFilterInfo, bound);

		const date = parseDate(epoch ?? '');

		return isInvalidDate(date)
			? undefined
			: date.toISOString();
	}

	function getAddFilterNumericValue(addFilterInfo : AddFilterInfo, bound : 'lower' | 'upper') : number | undefined {
		return (addFilterInfo.value ?? {})[ bound ];
	}

	function hasValue(addFilterInfo : AddFilterInfo, bound : 'lower' | 'upper') : boolean {
		const type = $columnMap?.[ addFilterInfo.key ]?.type;

		if (type === 'string') {
			return true;
		}

		const value = getAddFilterNumericValue(addFilterInfo, bound);

		return value != null && typeof value === 'number';
	}

	function handleAlertIonChange(event : any) : void {
		if (event?.target?.matches('ion-range')) {
			updateRange(event?.detail?.value ?? {});
		}
	}

	let dateTimeModalElementMap : { lower? : HTMLIonModalElement, upper? : HTMLIonModalElement } = {};

	function handleAlertClick(event : any) : void {
		const bound : 'lower' | 'upper' = event?.target?.dataset?.bound;

		if (!bound) {
			return;
		}

		dateTimeModalElementMap[ bound ]?.present();
	}
</script>


<style lang="scss">
	.filter-container {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
		margin-bottom: 20px;

		:first-child {
			margin-left: 0;
		}

		ion-button,
		ion-chip {
			margin: 0;
			box-shadow: var(--drop-shadow);
		}
	}

	ion-chip {
		border: 0.5px solid #c8c7cc;
	}

	.add-filter-popover-trigger {
		min-height: 32px;
		border-radius: 6px;
	}

	ion-alert {
		&.lacks-lower-value,
		&.lacks-upper-value {
			:global(.alert-button-role-confirm) {
				pointer-events: none;
			}

			:global(.alert-button-role-confirm .alert-button-inner) {
				opacity: 0.5;
			}
		}

		&.lacks-lower-value {
			:global(.lower-value ion-datetime-button) {
				display: none;
			}

			:global(.lower-value ion-button) {
				display: block;
			}
		}

		&.lacks-upper-value {
			:global(.upper-value ion-datetime-button) {
				display: none;
			}

			:global(.upper-value ion-button) {
				display: block;
			}
		}

		:global(.lower-value ion-button),
		:global(.upper-value ion-button) {
			display: none;
		}
	}

	:global(.time-filter-alert-list) {
		margin-top: 14px;
		background-color: transparent;
	}

	:global(.time-filter-alert-list ion-item) {
		--padding-start: 0;
		--inner-padding-end: 0;
		--background: transparent;
	}

	:global(.time-filter-alert-list ion-label) {
		margin-left: 0;
		margin-right: 0;
	}
</style>


<div class="filter-container">
	{#if storeInstance.opts?.defaultTimeFilter }
		{@const timeFilter = storeInstance.opts.defaultTimeFilter }
		{@const timeKey = timeFilter.key }

		{#if timeKey in $filterMap }
			<ion-chip id="{ timeKey }PopoverTrigger">
				<ion-label>
					<strong>{ $columnMap?.[ timeKey ]?.name }:</strong>

					{ getFilterChipValue(timeKey, $filterMap[ timeKey ]) }
				</ion-label>

				<ion-icon
					icon={ chevronDown }
					color="dark"
				></ion-icon>
			</ion-chip>

			<ion-popover
				trigger="{ timeKey }PopoverTrigger"
				dismiss-on-select={ true }
			>
				<ion-content>
					<ion-list>
						{#each timeFilter.options as option, index }
							<ion-item
								button={ true }
								detail={ false }
								disabled={ $filterMap[ timeKey ]?.[0] === option }
								lines={ !timeFilter.allowCustomRange && index === timeFilter.options.length - 1 ? 'none' : 'inset' }
								on:click={ () => handleUpdateTimeFilter(timeKey, option)}
								on:keydown={ (e) => HEK(e, () => handleUpdateTimeFilter(timeKey, option)) }
							>
								<ion-label>{ option }</ion-label>
							</ion-item>
						{/each }

						{#if timeFilter.allowCustomRange }
							<ion-item
								button={ true }
								detail={ false }
								lines="none"
								on:click={ () => handleAddFilter(timeKey)}
								on:keydown={ (e) => HEK(e, () => handleAddFilter(timeKey)) }
							>
								<ion-label>custom range</ion-label>
							</ion-item>
						{/if}
					</ion-list>
				</ion-content>
			</ion-popover>
		{/if}
	{/if }

	{#each objectEntries($filterMap) as [ key, values ] }
		{#if key !== storeInstance.opts?.defaultTimeFilter?.key }
			<ion-chip
				on:click={ () => handleChipClick(key) }
				on:keydown={ (e) => HEK(e, () => handleChipClick(key)) }
				disabled={ chipClickedMap[ key ] }
			>
				<ion-label>
					<strong>{ $columnMap?.[ key ].name }:</strong>

					{ getFilterChipValue(key, values) }
				</ion-label>

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
		disabled={ Object.keys($selectableFilters).length === 0 }
	>
		<ion-icon
			slot="start"
			size="small"
			icon={ filterIcon }
		></ion-icon>

		Add Filter
	</ion-button>

	{#if Object.keys($selectableFilters).length > 0 }
		<ion-popover
			trigger="addFilterPopoverTrigger"
			dismiss-on-select={ true }
		>
			<ion-content>
				<ion-list>
					{#each $selectableFilters as key, index }
						<ion-item
							button={ true }
							detail={ false }
							lines={ index === $selectableFilters.length - 1 ? 'none' : 'inset' }
							disabled={ $filterMap[ key ] != null }
							on:click={ () => handleAddFilter(key)}
							on:keydown={ (e) => HEK(e, () => handleAddFilter(key)) }
						>{ $columnMap?.[ key ].name }</ion-item>
					{/each }
				</ion-list>
			</ion-content>
		</ion-popover>
	{/if }
</div>

{#if Object.keys($filterableColumns).length > 0 }
	<ion-modal
		bind:this={ dateTimeModalElementMap.lower }
		on:willPresent={ handleDatetimeModalWillPresent }
		on:willDismiss={ handleDatetimeModalWillDismiss }
	>
		<ion-datetime
			id="datetimeLower"
			name="lower"
			title="lower"
			show-default-title={ false }
			show-default-buttons={ true }
			value={ parseISODate($addFilterInfo, 'lower') }
			on:ionChange={ handleDatetimeChange }
		>
			<span slot="title">Starting Date/Time</span>
		</ion-datetime>
	</ion-modal>

	<ion-modal
		bind:this={ dateTimeModalElementMap.upper }
		on:willPresent={ handleDatetimeModalWillPresent }
		on:willDismiss={ handleDatetimeModalWillDismiss }
	>
		<ion-datetime
			id="datetimeUpper"
			name="upper"
			title="upper"
			show-default-title={ false }
			show-default-buttons={ true }
			value={ parseISODate($addFilterInfo, 'upper') }
			on:ionChange={ handleDatetimeChange }
		>
			<span slot="title">Ending Date/Time</span>
		</ion-datetime>
	</ion-modal>
{/if }

<ion-alert
	bind:this={ alertElement }
	class:lacks-lower-value={ !hasValue($addFilterInfo, 'lower') }
	class:lacks-upper-value={ !hasValue($addFilterInfo, 'upper') }
	on:didDismiss={ handleDismissAddFilterAlert }
	on:ionChange={ handleAlertIonChange }
	on:click={ handleAlertClick }
	on:keydown={ (e) => HEK(e, handleAlertClick) }
></ion-alert>
