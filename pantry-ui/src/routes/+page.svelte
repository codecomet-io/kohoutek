<script lang="ts">
	import type { PageData } from './$types';
	import type { Pipeline } from '../../../data_importer/lib/model';

	import PipelineHeader from '$lib/components/PipelineHeader.svelte';
	import FilesetsList from '$lib/components/FilesetsList.svelte';
	import ActionsList from '$lib/components/ActionsList.svelte';


	export let data: PageData;

	const pipeline = <Pipeline>data.pipeline;
</script>


<style lang="scss">
	h2 {
		padding-top: 0;
		padding-bottom: 0;
	}
</style>


<PipelineHeader pipeline={ pipeline } />

<ion-content fullscreen={ true }>
	<h2 class="ion-padding">Fileset{ pipeline.filesets.length === 1 ? '' : 's' }</h2>

	<FilesetsList filesets={ pipeline.filesets } />

	<h2 class="ion-padding">Actions</h2>

	<ActionsList actions={ pipeline.actions } />
</ion-content>
