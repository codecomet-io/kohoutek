<script lang="ts">
	import type { FilesetAction } from '../../../../data_importer/lib/model';
	import type { HighlightInfo } from '$lib/types/highlight';

	import FilesetsListItem from '$lib/components/FilesetsListItem.svelte';


	export let filesets : FilesetAction[]
	export let highlight : HighlightInfo
</script>


<style lang="scss"></style>


<ion-accordion-group expand="inset">
	{#each filesets as fileset }
		<FilesetsListItem
			fileset={ fileset }
			highlight={ highlight.active && highlight.digest === fileset.digest }
		/>
	{/each}
</ion-accordion-group>
