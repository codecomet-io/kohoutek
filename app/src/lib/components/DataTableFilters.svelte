<script lang="ts">
	import type { AlertInput } from '@ionic/core';

	import { onMount } from 'svelte';
	import { lapsed } from 'briznads-helpers';
	import { filter as filterIcon, closeCircle } from 'ionicons/icons';
	import { HEK, objectEntries, getEndpoints } from '$lib/helper';
	import { runsTable } from '$lib/stores/runs-table';


	const {
		columnMap,
		filterMap,
		addFilterInfo,
		runs,
		finiteFilterValuesMap,
		filterableColumns,
	} = runsTable;

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

	function getFilterChipValue(key : string, values : any[]) : string {
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

		runsTable.updateFilterMap(key, values);
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
		}
	}

	.add-filter-popover-trigger {
		min-height: 32px;
	}
</style>


<div class="filter-container">
	{#each objectEntries($filterMap) as [ key, values ] }
		<ion-chip
			on:click={ () => runsTable.updateFilterMap(key) }
			on:keydown={ (e) => HEK(e, () => runsTable.updateFilterMap(key)) }
		>
			<ion-label><strong>{ $columnMap?.[ key ].name }:</strong> { getFilterChipValue(key, values) }</ion-label>

			<ion-icon
				icon={ closeCircle }
				color="dark"
			></ion-icon>
		</ion-chip>
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

	<ion-alert
		bind:this={ addFilterAlertElement }
		on:didDismiss={ handleDismissAddFilterAlert }
	></ion-alert>
</div>
