<script lang="ts">
	import type { FilesetAction } from '../../../../data_importer/lib/model';
	import type { Action } from '../../../../data_importer/lib/model';
	import type { HighlightInfo } from '$lib/types/highlight';

	import { isPopulated, gotoSearchString } from '$lib/helper';

	import FilesetsListItem from '$lib/components/FilesetsListItem.svelte';
	import ActionsListItem from '$lib/components/ActionsListItem.svelte';


	export let filesets : FilesetAction[] | undefined = undefined
	export let actions : Action[] | undefined = undefined
	export let highlight : HighlightInfo
	export let activeAccordion : string
	export let activeModal : string
	export let highlightLine : number

	function handleValueChange(event : any) : void {
		const id : string = event.detail.value

		if (id === activeAccordion) {
			return
		}

		gotoSearchString('active_accordion', id)
	}
</script>


<style lang="scss"></style>


{#if isPopulated(filesets) || isPopulated(actions) }
	<ion-accordion-group
		expand="inset"
		value={ activeAccordion }
		on:ionChange={ handleValueChange }
	>
		{#if filesets && isPopulated(filesets) }
			{#each filesets as fileset }
				<FilesetsListItem
					fileset={ fileset }
					highlight={ highlight.active && highlight.id === fileset.id }
					activeModal={ activeModal }
					highlightLine={ highlightLine }
				/>
			{/each}
		{:else if actions && isPopulated(actions) }
			{#each actions as action }
				<ActionsListItem
					action={ action }
					highlight={ highlight.active && highlight.id === action.id }
					activeModal={ activeModal }
					highlightLine={ highlightLine }
					on:highlightParent
				/>
			{/each}
		{/if}
	</ion-accordion-group>
{/if}
