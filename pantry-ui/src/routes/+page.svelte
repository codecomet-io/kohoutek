<script lang="ts">
	import type { PageData } from './$types';
	import type { Pipeline } from '../../../data_importer/lib/model';
	import type { HighlightInfo } from '$lib/types/highlight';

	import { page } from '$app/stores';

	import PipelineHeader from '$lib/components/PipelineHeader.svelte';
	import IconKey from '$lib/components/IconKey.svelte';
	import FilesetsOrActionsList from '$lib/components/FilesetsOrActionsList.svelte';
	import FilesetsOrActionsHeader from '$lib/components/FilesetsOrActionsHeader.svelte';


	export let data : PageData

	const pipeline : Pipeline = data.pipeline

	let activeAccordion : string
	let activeModal : string

	$: updateFromParams(data.searchParams)

	function updateFromParams(searchParams : URLSearchParams) : void {
		activeAccordion = searchParams.get('active_accordion') ?? ''

		scrollTo(activeAccordion)

		activeModal = searchParams.get('active_modal') ?? ''
	}

	function scrollTo(id : string) : void {
		if (!id) {
			return
		}

		const accordion = document.querySelector(`ion-accordion[data-id="${ id }"]`)

		if (!(accordion && accordion instanceof HTMLElement)) {
			return
		}

		ionContent.scrollToPoint(null, accordion.offsetTop - 16, 1000)
	}

	let ionContent : HTMLIonContentElement

	let highlight : HighlightInfo = {
		id : '',
		active : false,
	}

	function highlightParent(event : any) : void {
		highlight = event.detail
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


<PipelineHeader
	pipeline={ pipeline }
	on:highlightParent={ highlightParent }
/>

<ion-content
	fullscreen={ true }
	bind:this={ ionContent }
>
	<div class="max-width-wrapper">
		<FilesetsOrActionsHeader items={ pipeline?.filesets }>
			<IconKey />
		</FilesetsOrActionsHeader>

		<FilesetsOrActionsList
			filesets={ pipeline?.filesets }
			highlight={ highlight }
			activeAccordion={ activeAccordion }
			activeModal={ activeModal }
		/>

		<FilesetsOrActionsHeader items={ pipeline?.actions } />

		<FilesetsOrActionsList
			actions={ pipeline?.actions }
			highlight={ highlight }
			activeAccordion={ activeAccordion }
			activeModal={ activeModal }
			on:highlightParent={ highlightParent }
		/>
	</div>
</ion-content>
