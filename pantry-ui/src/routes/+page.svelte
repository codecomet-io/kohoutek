<script lang="ts">
	import type { PageData } from './$types';
	import type { Pipeline } from '../../../data_importer/lib/model';
	import type { HighlightInfo } from '$lib/types/highlight';

	import { page } from '$app/stores';

	import PipelineHeader from '$lib/components/PipelineHeader.svelte';
	import IconKey from '$lib/components/IconKey.svelte';
	import FilesetsOrActionsList from '$lib/components/FilesetsOrActionsList.svelte';
	import FilesetsOrActionsHeader from '$lib/components/FilesetsOrActionsHeader.svelte';


	export let data: PageData

	const pipeline = <Pipeline>data.pipeline

	let ionContent : HTMLIonContentElement

	let highlight : HighlightInfo = {
		digest : '',
		active : false,
	}

	let expand : string

	const hashReplaceRegex : RegExp = /^(?:.+)?#/

	page.subscribe((pageData) => {
		const { hash } = pageData?.url

		if (hash) {
			expand = hash.replace(hashReplaceRegex, '')
		}
	})

	function handleHashchange(event : any) : void {
		const digest : string = event.newURL.replace(hashReplaceRegex, '')

		expand = digest

		scrollTo(digest)
	}

	function scrollTo(digest : string) : void {
		const accordion = document.querySelector(`ion-accordion[data-digest="${ digest }"]`)

		if (!(accordion && accordion instanceof HTMLElement)) {
			return
		}

		ionContent.scrollToPoint(null, accordion.offsetTop - 16, 1000)
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
		/>
	</div>
</ion-content>

<svelte:window on:hashchange={ handleHashchange } />
