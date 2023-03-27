<script lang="ts">
	import type { FilesetAction } from '../../../../data_importer/lib/model';
	import type { Action } from '../../../../data_importer/lib/model';
	import type { HighlightInfo } from '$lib/types/highlight';

	import { isPopulated } from '$lib/helper';

	import FilesetsListItem from '$lib/components/FilesetsListItem.svelte';
	import ActionsListItem from '$lib/components/ActionsListItem.svelte';


	export let filesets : FilesetAction[] | undefined = undefined
	export let actions : Action[] | undefined = undefined
	export let highlight : HighlightInfo
	export let expand : string

	function handleValueChange(event : any) : void {
		const digest : string = event.detail.value

		if (digest !== expand) {
			window.location.hash = digest ?? ''
		}
	}
</script>


<style lang="scss"></style>


{#if isPopulated(filesets) || isPopulated(actions) }
	<ion-accordion-group
		expand="inset"
		value={ expand }
		on:ionChange={ handleValueChange }
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
				/>
			{/each}
		{/if}
	</ion-accordion-group>
{/if}
