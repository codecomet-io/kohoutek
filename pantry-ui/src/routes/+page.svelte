<script lang="ts">
	import type { PageData } from './$types';
	import type { Pipeline } from '../../../data_importer/lib/model';

	import PipelineHeader from '$lib/components/PipelineHeader.svelte';
	import FilesetsList from '$lib/components/FilesetsList.svelte';
	import ActionsList from '$lib/components/ActionsList.svelte';


	export let data: PageData

	const pipeline = <Pipeline>data.pipeline
</script>


<style lang="scss">
	h2 {
		padding-top: 0;
		padding-bottom: 0;
	}

	@media (min-width: 1280px) {
		.max-width-wrapper {
			max-width: 1280px;
			margin-left: auto;
			margin-right: auto;
		}
	}
</style>


<PipelineHeader pipeline={ pipeline } />

<ion-content fullscreen={ true }>
	<div class="max-width-wrapper">
		<h2 class="ion-padding">Fileset{ pipeline.filesets.length === 1 ? '' : 's' }</h2>

		<FilesetsList filesets={ pipeline.filesets } />

		<h2 class="ion-padding">Actions</h2>

		<ActionsList actions={ pipeline.actions } />
	</div>
</ion-content>
