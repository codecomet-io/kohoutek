<script
	lang="ts"
	context="module"
>
	import type { DataTable } from '$lib/stores/data-table';

	import { onMount } from 'svelte';
	import { menu } from 'ionicons/icons';

	import { HEK } from '$lib/helper';
</script>


<script lang="ts">
	export let storeInstance : DataTable;

	const {
		columnMap,
		selectedColumns,
		selectableColumns,
	} = storeInstance;

	let localStorageKey : string;

	let storedColumnsStr : string | null;

	function initStoredColumns() : void {
		localStorageKey = `dataTableSelectedColumns.${ storeInstance?.opts?.namespace }`;

		storedColumnsStr = window.localStorage.getItem(localStorageKey);

		storeInstance.initStoredColumns(storedColumnsStr);
	}

	onMount(initStoredColumns);

	function updateStoredColumns(columns : string[]) : void {
		if (storedColumnsStr === undefined || columns.length === 0) {
			return;
		}

		window.localStorage.setItem(localStorageKey, JSON.stringify(columns));
	}

	$: updateStoredColumns($selectedColumns);

	let ionSelectColumns : HTMLIonSelectElement;

	onMount(() => {
		ionSelectColumns.interfaceOptions = {
			header    : 'Select Columns',
			subHeader : 'View and filter by specific columns',
		};
	});

	function handleColumnChange(event : any) : void {
		selectedColumns.set(event?.detail?.value ?? []);
	}
</script>


<style lang="scss">
	.select-columns-trigger {
		--padding-top: 0;
		--padding-end: 0;
		--padding-bottom: 0;
		--padding-start: 0;

		width: 40px;
		height: 40px;
		position: absolute;
		top: 4px;
		right: 0;
		margin: 0;

		ion-icon {
			transform: rotate(90deg);
		}
	}
</style>


<ion-select
	class="visually-hidden"
	bind:this={ ionSelectColumns }
	aria-label="column chooser"
	placeholder="Select available columns"
	multiple={ true }
	value={ $selectedColumns }
	on:ionChange={ handleColumnChange }
>
	{#each $selectableColumns as key }
		<ion-select-option value={ key }>{ $columnMap?.[ key ].name }</ion-select-option>
	{/each}
</ion-select>

<ion-button
	class="select-columns-trigger"
	fill="clear"
	color="dark"
	size="small"
	on:click={ () => ionSelectColumns.open() }
	on:keydown={ (e) => HEK(e, () => ionSelectColumns.open()) }
>
	<ion-icon
		slot="icon-only"
		icon={ menu }
	></ion-icon>
</ion-button>
