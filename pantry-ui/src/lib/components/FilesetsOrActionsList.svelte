<script lang="ts">
	import type { FilesetAction } from '../../../../data_importer/lib/model';
	import type { Action } from '../../../../data_importer/lib/model';

	import { isPopulated, gotoSearchString } from '$lib/helper';

	import { activeAccordion } from '$lib/stores'

	import FilesetsListItem from '$lib/components/FilesetsListItem.svelte';
	import ActionsListItem from '$lib/components/ActionsListItem.svelte';


	export let filesets : FilesetAction[] | undefined = undefined
	export let actions : Action[] | undefined = undefined

	function handleValueChange(id : string, activeAccordion : string) : void {
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
		value={ $activeAccordion }
		on:ionChange={ (event) => handleValueChange(event.detail.value, $activeAccordion) }
	>
		{#if filesets && isPopulated(filesets) }
			{#each filesets as fileset }
				<FilesetsListItem fileset={ fileset } />
			{/each}
		{:else if actions && isPopulated(actions) }
			{#each actions as action }
				<ActionsListItem action={ action } />
			{/each}
		{/if}
	</ion-accordion-group>
{/if}
