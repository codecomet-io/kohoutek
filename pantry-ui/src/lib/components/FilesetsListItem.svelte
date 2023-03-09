<script lang="ts">
	import type { Fileset } from '../../../../data_importer/lib/model';

	import { createEventDispatcher } from 'svelte';

	import { getDateString, getTimeString } from '$lib/helper';

	import FilesetOrActionTypeIcon from '$lib/components/FilesetOrActionTypeIcon.svelte';
	import ChunkyLabel from '$lib/components/ChunkyLabel.svelte';


	export let fileset : Fileset;
</script>


<style lang="scss">
	[slot="header"] {
		:global(.fileset-or-action-type-icon) {
			margin-right: 0.25em;
		}
	}

	article {
		display: flex;
		flex-wrap: wrap;
		gap: 1em;
	}

	.column-container {
		flex: 1;
		min-width: 100px;

		.key,
		.value {
			white-space: nowrap;
		}

		.key {
			margin-bottom: 4px;
			color: #57606a;
			font-size: 12px;
		}

		.value {
			display: block;
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
			color: #24292f;
			font-size: 16px;
			font-weight: 600;
		}
	}
</style>


<ion-accordion
	value={ fileset.source }
	toggle-icon-slot="start"
>
	<ion-item
		slot="header"
		color="light"
	>
		<FilesetOrActionTypeIcon
			slot="start"
			type={ fileset.type }
		/>

		<ion-label>{ fileset.name }</ion-label>
	</ion-item>

	<article
		class="ion-padding"
		slot="content"
	>
		<div class="column-container">
			<header class="key">type</header>

			<div class="value">{ fileset.type }</div>
		</div>

		<div
			class="column-container"
			title={ fileset.source }
		>
			<header class="key">source</header>

			<div class="value">{ fileset.source }</div>
		</div>
	</article>
</ion-accordion>
