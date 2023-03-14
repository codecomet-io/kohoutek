<script lang="ts">
	import type { PageData } from './$types';
	import type { Pipeline } from '../../../data_importer/lib/model';
	import type { HighlightInfo } from '$lib/types/highlight';

	import PipelineHeader from '$lib/components/PipelineHeader.svelte';
	import IconKey from '$lib/components/IconKey.svelte';
	import FilesetsOrActionsList from '$lib/components/FilesetsOrActionsList.svelte';
	import FilesetsOrActionsHeader from '$lib/components/FilesetsOrActionsHeader.svelte';


	export let data: PageData

	const pipeline = <Pipeline>data.pipeline

	let highlight : HighlightInfo = {
		digest : '',
		active : false,
	}

	let expand : string

	function highlightParent(event : any) : void {
		highlight = event.detail
	}

	function expandParent(event : any) : void {
		expand = event.detail?.digest
	}
</script>


<style lang="scss">
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
		<FilesetsOrActionsHeader  filesets={ pipeline.filesets }>
			<IconKey />
		</FilesetsOrActionsHeader>

		<FilesetsOrActionsList
			filesets={ pipeline.filesets }
			highlight={ highlight }
			expand={ expand }
		/>

		<FilesetsOrActionsHeader actions={ pipeline.actions } />

		<FilesetsOrActionsList
			actions={ pipeline.actions }
			highlight={ highlight }
			expand={ expand }
			on:highlightParent={ highlightParent }
			on:expandParent={ expandParent }
		/>
	</div>
</ion-content>
