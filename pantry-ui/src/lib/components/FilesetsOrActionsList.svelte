<script lang="ts">
	import type { FilesetAction } from '../../../../data_importer/lib/model';
	import type { Action } from '../../../../data_importer/lib/model';
	import type { HighlightInfo } from '$lib/types/highlight';

	import FilesetsListItem from '$lib/components/FilesetsListItem.svelte';
	import ActionsListItem from '$lib/components/ActionsListItem.svelte';


	export let filesets : FilesetAction[] | undefined = undefined
	export let actions : Action[] | undefined = undefined
	export let highlight : HighlightInfo
	export let expand : string

	let accordionGroup : HTMLIonAccordionGroupElement

	$: if (accordionGroup) {
		accordionGroup.value = expand
	}

	function isPopulated(list : typeof filesets | typeof actions) : boolean {
		return Array.isArray(list) && list.length > 0
	}
</script>


<style lang="scss"></style>


{#if isPopulated(filesets) || isPopulated(actions) }
	<ion-accordion-group
		expand="inset"
		bind:this={ accordionGroup }
	>
		{#if filesets && isPopulated(filesets) }
			{#each filesets as fileset }
				<FilesetsListItem
					fileset={ fileset }
					highlight={ highlight.active && highlight.digest === fileset.digest }
				/>
			{/each}
		{:else if actions && isPopulated(actions) }
			{#each actions as action }
				<ActionsListItem
					action={ action }
					highlight={ highlight.active && highlight.digest === action.digest }
					on:highlightParent
					on:expandParent
				/>
			{/each}
		{/if}
	</ion-accordion-group>
{/if}
