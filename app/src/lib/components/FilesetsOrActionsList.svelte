<script lang="ts">
	import { isListPopulated } from 'briznads-helpers';

	import type { FilesetAction } from '../../../../pantry/src/lib/model';
	import type { Action } from '../../../../pantry/src/lib/model';

	import { gotoSearchString } from '$lib/helper';

	import { active as activeAccordion } from '$lib/stores/accordion';

	import FilesetsListItem from '$lib/components/FilesetsListItem.svelte';
	import ActionsListItem from '$lib/components/ActionsListItem.svelte';


	export let filesets : FilesetAction[] | undefined = undefined;
	export let actions : Action[] | undefined = undefined;

	function handleValueChange(event : any) : void {
		const id = event.detail.value;

		if (id === $activeAccordion) {
			return;
		}

		gotoSearchString('active_accordion', id);
	}
</script>


<style lang="scss">
	ion-accordion-group {
		box-shadow: rgba(0, 0, 0, 0.12) 0px 4px 16px;
		border-radius: 8px;
	}
</style>


{#if isListPopulated(filesets) || isListPopulated(actions) }
	<ion-accordion-group
		expand="inset"
		value={ $activeAccordion }
		on:ionChange={ handleValueChange }
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
