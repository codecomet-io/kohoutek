<script lang="ts">
	import { gotoSearchString } from '$lib/helper';
	import { runsTable } from '$lib/stores/runs-table';


	export let searchParams : URLSearchParams;

	const {
		activeSearch,
	} = runsTable;

	function updateFromParams(searchParams : URLSearchParams) : void {
		const search = searchParams.get('search') ?? '';

		activeSearch.set(search);
	}

	$: updateFromParams(searchParams);

	function handleSearchInput(event : any) : void {
		gotoSearchString('search', event.detail?.value);
	}
</script>


<style lang="scss">
	ion-searchbar {
		--border-radius: var(--rounded-corner-radius) var(--rounded-corner-radius) 0 0;

		padding: 0;
		height: auto;
		contain: none;
		border-style: solid;
		border-color: #c8c7cc;
		border-width: 0.5px 0.5px 0 0.5px;
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
	value={ $activeSearch }
	on:ionInput={ handleSearchInput }
></ion-searchbar>
