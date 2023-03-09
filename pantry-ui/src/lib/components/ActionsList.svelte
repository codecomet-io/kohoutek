<script lang="ts">
	import type { Action } from '../../../../data_importer/lib/model';

	import ActionsListItem from '$lib/components/ActionsListItem.svelte';


	export let actions : Action[];

	let highlightAction : string;
	let highlightActive : boolean;

	function handleHighlightAction(event : any) : void {
		highlightAction = event.detail.actionId;
		highlightActive = event.detail.active;
	}
</script>


<style lang="scss"></style>


<ion-accordion-group expand="inset">
	{#each actions as action }
		<ActionsListItem
			action={ action }
			highlight={ highlightActive && highlightAction === action.id }
			on:highlightAction="{ handleHighlightAction }"
		/>
	{/each}
</ion-accordion-group>
