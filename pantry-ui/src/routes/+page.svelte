<script lang="ts">
	import type { PageData } from './$types';
	import type { Pipeline } from '../../../data_importer/src/lib/model';

	import { activeAccordion, activeModal, highlightLine } from '$lib/stores';

	import PipelineHeader from '$lib/components/PipelineHeader.svelte';
	import IconKey from '$lib/components/IconKey.svelte';
	import FilesetsOrActionsList from '$lib/components/FilesetsOrActionsList.svelte';
	import FilesetsOrActionsHeader from '$lib/components/FilesetsOrActionsHeader.svelte';


	export let data : PageData;

	const pipeline : Pipeline = data.pipeline;

	$: updateFromParams(data.searchParams);

	function updateFromParams(searchParams : URLSearchParams) : void {
		const active_accordion = searchParams.get('active_accordion') ?? '';
		const active_modal = searchParams.get('active_modal') ?? '';
		const highlight_line = searchParams.get('highlight_line') ?? '';

		activeAccordion.set(active_accordion);
		activeModal.set(active_modal);
		highlightLine.active.set(highlight_line);

		scrollTo(active_accordion);
	}

	function scrollTo(id : string) : void {
		if (!id) {
			return;
		}

		const accordion = document.querySelector(`ion-accordion[data-id="${ id }"]`);

		if (!(accordion && accordion instanceof HTMLElement)) {
			return;
		}

		ionContent.scrollToPoint(null, accordion.offsetTop - 16, 1000);
	}

	let ionContent : HTMLIonContentElement;
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

<ion-content
	fullscreen={ true }
	bind:this={ ionContent }
>
	<div class="max-width-wrapper">
		<FilesetsOrActionsHeader items={ pipeline?.filesets }>
			<IconKey />
		</FilesetsOrActionsHeader>

		<FilesetsOrActionsList filesets={ pipeline?.filesets } />

		<FilesetsOrActionsHeader items={ pipeline?.actions } />

		<FilesetsOrActionsList actions={ pipeline?.actions } />
	</div>
</ion-content>
