<script lang="ts">
	import type { Action } from '../../../../data_importer/lib/model';
	import type { HighlightInfo } from '$lib/types/highlight';

	import ActionsListItem from '$lib/components/ActionsListItem.svelte';


	export let actions : Action[]
	export let highlight : HighlightInfo
</script>


<style lang="scss"></style>


<ion-accordion-group expand="inset">
	{#each actions as action }
		<ActionsListItem
			action={ action }
			highlight={ highlight.active && highlight.digest === action.digest }
			on:highlightFilesetOrAction
		/>
	{/each}
</ion-accordion-group>
