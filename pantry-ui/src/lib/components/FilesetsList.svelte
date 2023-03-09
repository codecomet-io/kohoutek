<script lang="ts">
	import type { Fileset } from '../../../../data_importer/lib/model';

	import FilesetsListItem from '$lib/components/FilesetsListItem.svelte';


	export let filesets : Fileset[];
</script>


<style lang="scss"></style>


<ion-accordion-group expand="inset">
	{#each filesets as fileset }
		<FilesetsListItem fileset={ fileset } />
	{/each}
</ion-accordion-group>
