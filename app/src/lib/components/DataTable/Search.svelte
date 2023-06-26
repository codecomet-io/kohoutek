<script
	lang="ts"
	context="module"
>
	import type { DataTable } from '$stores/data-table';

	import { gotoSearchString } from '$utilities/helper';
</script>


<script lang="ts">
	export let searchParams : URLSearchParams;
	export let storeInstance : DataTable;

	let stolenFocus : boolean;

	const {
		activeSearch,
	} = storeInstance;

	function updateFromParams(searchParams : URLSearchParams) : void {
		const search = searchParams.get('search') ?? '';

		activeSearch.set(search);

		stolenFocus = true;
	}

	$: updateFromParams(searchParams);

	let ionSearchbar : HTMLIonSearchbarElement;

	function handleInput(event : any) : void {
		gotoSearchString('search', event.detail?.value);
	}

	function handleFocus(event : any) : void {
		stolenFocus = false;
	}

	async function handleBlur(event : any) : Promise<void> {
		if (stolenFocus) {
			setTimeout(() => {
				ionSearchbar.setFocus();
			}, 10);
		}
	}
</script>


<style lang="scss">
	ion-searchbar {
		--border-radius: var(--rounded-corner-radius) var(--rounded-corner-radius) 0 0;

		padding: 0;
		height: auto;
		contain: none;
		border-style: solid;
		border-color: var(--border-color);
		border-width: var(--outer-border-width) var(--outer-border-width) 0 var(--outer-border-width);
		border-top-left-radius: var(--rounded-corner-radius);
		border-top-right-radius: var(--rounded-corner-radius);

		:global(.searchbar-input-container) {
			height: 40px;
		}

		// tripling specificity to overwrite upstream styles
		:global(.searchbar-input.searchbar-input.searchbar-input) {
			padding-inline-start: 44px;
			padding-inline-end: 33px;
		}

		:global(.searchbar-search-icon) {
			inset-inline-start: 1em;
		}

		:global(.searchbar-clear-button) {
			inset-inline-end: 5px;
		}
	}
</style>


<ion-searchbar
	bind:this={ ionSearchbar }
	value={ $activeSearch }
	on:ionInput={ handleInput }
	on:ionFocus={ handleFocus }
	on:ionBlur={ handleBlur }
></ion-searchbar>
