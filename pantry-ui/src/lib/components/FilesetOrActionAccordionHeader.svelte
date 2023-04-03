<script lang="ts">
	import type { FilesetAction, Action } from '../../../../data_importer/lib/model';

	import { receiptOutline } from 'ionicons/icons';

	import { parseLapsed, gotoSearchString } from '$lib/helper';

	import FilesetOrActionTypeIcon from '$lib/components/FilesetOrActionTypeIcon.svelte';
	import StatusIcon from '$lib/components/StatusIcon.svelte';
	import ChunkyLabel from '$lib/components/ChunkyLabel.svelte';


	export let item : FilesetAction | Action

	$: iconType = (item as FilesetAction).filesetType ?? item.type

	// support GitLab icon for GitLab-hosted filesets
	let customIcon : 'gitlab'

	$: if ((item as FilesetAction).filesetType === 'git' && /\/\/(?:www\.)?gitlab\.com\//.test((item as FilesetAction).source)) {
		customIcon = 'gitlab'
	}
</script>


<style lang="scss">
	:global(ion-item[slot="header"] .fileset-or-action-type-icon) {
		margin-right: 0.25em;
	}

	:global(ion-item[slot="header"] .status-icon) {
		margin-left: 0.25em;
	}
</style>


<FilesetOrActionTypeIcon
	type={ iconType }
	icon={ customIcon }
/>

<ion-label>{ item.name }</ion-label>

{#if item.groupedLogs }
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<ion-button
		fill="clear"
		color={ item.status === 'errored' ? 'danger' :'medium' }
		aria-label="open logs modal"
		on:click|stopPropagation={ () => gotoSearchString('active_modal', item.id) }
	>
		<ion-icon
			slot="icon-only"
			class="log-icon"
			icon={ receiptOutline }
			size="small"
			title="view logs"
		></ion-icon>
	</ion-button>
{/if}

{#if item.status === 'cached' }
	<ChunkyLabel>cached</ChunkyLabel>
{:else if item.runtime }
	<ChunkyLabel
		title={ parseLapsed(item.runtime, false, true) || undefined }
		allcaps={ false }
	>
		{ parseLapsed(item.runtime, true) || '0ms' }
	</ChunkyLabel>
{/if}

<StatusIcon status={ item.status } />
