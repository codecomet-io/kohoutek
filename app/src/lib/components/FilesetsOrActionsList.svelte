<script lang="ts">
	import { isListPopulated } from 'briznads-helpers';

	import type { FilesetAction } from '../../../../pantry/src/lib/model';
	import type { Action } from '../../../../pantry/src/lib/model';

	import { gotoSearchString } from '$lib/helper';

	import { activeAccordion } from '$lib/stores';

	import FilesetsListItem from '$lib/components/FilesetsListItem.svelte';
	import ActionsListItem from '$lib/components/ActionsListItem.svelte';


	export let filesets : FilesetAction[] | undefined = undefined;
	export let actions : Action[] | undefined = undefined;

	function handleValueChange(id : string, activeAccordion : string) : void {
		if (id === activeAccordion) {
			return;
		}

		gotoSearchString('active_accordion', id);
	}
</script>


<style lang="scss"></style>


{#if isListPopulated(filesets) || isListPopulated(actions) }
	<ion-accordion-group
		expand="inset"
		value={ $activeAccordion }
		on:ionChange={ (event) => handleValueChange(event.detail.value, $activeAccordion) }
	>
		{#if filesets && isListPopulated(filesets) }
			{#each filesets as fileset }
				<FilesetsListItem fileset={ fileset } />
			{/each}
		{:else if actions && isListPopulated(actions) }
			{#each actions as action }
				<ActionsListItem action={ action } />
			{/each}
		{/if}
	</ion-accordion-group>
{/if}
