<script lang="ts">
	import type { DataTable } from '$lib/stores/data-table';

	import { arrowUpOutline } from 'ionicons/icons';
	import { HEK, gotoSearchString } from '$lib/helper';


	export let storeInstance : DataTable;
	export let key : string;

	const {
		activeSort,
	} = storeInstance;

	function updateActiveSort(key : string) : void {
		const currentActiveSort = $activeSort;

		let direction : 'ascending' | 'descending' = 'ascending';

		if (currentActiveSort.key === key && currentActiveSort.direction === 'ascending') {
			direction = 'descending';
		}

		gotoSearchString({
			direction,
			sort : key,
		});
	}
</script>


<style lang="scss">
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

		&.descending {
			transform: rotate(180deg);
			transition-delay: 0ms;
		}
	}
</style>


<ion-button
	fill="clear"
	size="small"
	color="medium"
	class="sort-button"
	class:descending={ $activeSort.key === key && $activeSort.direction === 'descending' }
	on:click={ () => updateActiveSort(key) }
	on:keydown={ (e) => HEK(e, () => updateActiveSort(key)) }
>
	<ion-icon
		slot="icon-only"
		icon={ arrowUpOutline }
	></ion-icon>
</ion-button>
