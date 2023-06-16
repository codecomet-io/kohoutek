<script
	lang="ts"
	context="module"
>
	import type { Run } from '../../../../pantry/src/lib/model';

	import { sleep } from 'briznads-helpers';

	import { scrollContainer } from '$lib/stores/scroll-container';
	import { active as activeAccordion } from '$lib/stores/accordion';
	import { active as activeModal } from '$lib/stores/modal';
	import { highlight } from '$lib/stores/log-line';

	import RunHeader from '$lib/components/RunHeader.svelte';
	import IconKey from '$lib/components/IconKey.svelte';
	import FilesetsOrActionsList from '$lib/components/FilesetsOrActionsList.svelte';
	import FilesetsOrActionsHeader from '$lib/components/FilesetsOrActionsHeader.svelte';
</script>


<script lang="ts">
	export let run : Run;
	export let searchParams : URLSearchParams;
	export let anonymous : boolean = false;

	function updateFromParams(searchParams : URLSearchParams) : void {
		const active_accordion = searchParams.get('active_accordion') ?? '';
		const active_modal = searchParams.get('active_modal') ?? '';
		const highlight_line = searchParams.get('highlight_line') ?? '';

		activeAccordion.set(active_accordion);
		activeModal.set(active_modal);
		highlight.set(highlight_line);

		scrollTo(active_accordion);
	}

	$: updateFromParams(searchParams);

	let accordion : HTMLElement;

	async function scrollTo(id : string) : Promise<void> {
		if (!id) {
			return;
		}

		initAccordionElement(id);

		// wait for the scroll container element, passed in from the upstream +layout.svelte layer,
		// and for the accordion element, to mount
		// before attempting to reference either for an initial scroll on page load
		if (!(accordion && $scrollContainer)) {
			await sleep(10);

			initAccordionElement(id);
		}

		if (!(accordion && accordion instanceof HTMLElement)) {
			return;
		}

		$scrollContainer?.scrollToPoint(null, accordion.offsetTop - 16, 1000);
	}

	function initAccordionElement(id : string) : void {
		const element = document.querySelector(`ion-accordion[data-id="${ id }"]`) as HTMLElement;

		if (!element) {
			return;
		}

		accordion = element;
	}
</script>


<style lang="scss">
	.max-width-wrapper {
		margin-bottom: 70px;

		@media (min-width: 1280px) {
			max-width: 1280px;
			margin-left: auto;
			margin-right: auto;
		}
	}
</style>


<RunHeader { run } { anonymous } />

<div class="max-width-wrapper">
	<FilesetsOrActionsHeader items={ run?.filesets }>
		<IconKey />
	</FilesetsOrActionsHeader>

	<FilesetsOrActionsList filesets={ run?.filesets } />

	<FilesetsOrActionsHeader items={ run?.actions } />

	<FilesetsOrActionsList actions={ run?.actions } />
</div>
