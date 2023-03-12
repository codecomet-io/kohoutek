<script lang="ts">
	import type { PageData } from './$types';
	import type { Pipeline } from '../../../data_importer/lib/model';
	import type { HighlightInfo } from '$lib/types/highlight';

	import { createEventDispatcher } from 'svelte';

	import PipelineHeader from '$lib/components/PipelineHeader.svelte';
	import IconKey from '$lib/components/IconKey.svelte';
	import FilesetsList from '$lib/components/FilesetsList.svelte';
	import ActionsList from '$lib/components/ActionsList.svelte';


	export let data: PageData

	const pipeline = <Pipeline>data.pipeline

	const dispatch = createEventDispatcher()

	let highlight : HighlightInfo = {
		digest : '',
		active : false,
	}

	function handleHighlightAction(event : any) : void {
		highlight = event.detail
	}
</script>


<style lang="scss">
	.filesets-header-container,
	h2 {
		&.ion-padding {
			padding-top: 0;
			padding-bottom: 0;
		}
	}

	.filesets-header-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 18px;
		margin-bottom: 10px;

		h2 {
			margin-top: 0;
			margin-bottom: 0;
		}
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
		<div class="ion-padding filesets-header-container">
			<h2>Fileset{ pipeline.filesets.length === 1 ? '' : 's' }</h2>

			<IconKey />
		</div>

		<FilesetsList
			filesets={ pipeline.filesets }
			highlight={ highlight }
		/>

		<h2 class="ion-padding">Action{ pipeline.actions.length === 1 ? '' : 's' }</h2>

		<ActionsList
			actions={ pipeline.actions }
			highlight={ highlight }
			on:highlightFilesetOrAction="{ handleHighlightAction }"
		/>
	</div>
</ion-content>
