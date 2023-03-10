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

	a[target="_blank"] {
		&::after {
			content: url(data:image/svg+xml;charset=utf-8;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGNsYXNzPSJpb25pY29uIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiI+PHRpdGxlPk9wZW48L3RpdGxlPjxwYXRoIGQ9Ik0zODQgMjI0djE4NGE0MCA0MCAwIDAxLTQwIDQwSDEwNGE0MCA0MCAwIDAxLTQwLTQwVjE2OGE0MCA0MCAwIDAxNDAtNDBoMTY3LjQ4TTMzNiA2NGgxMTJ2MTEyTTIyNCAyODhMNDQwIDcyIiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjMyIi8+PC9zdmc+);
			display: inline-block;
			width: 1em;
			padding-left: 0.25em;
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

			<div class="value">
				{#if fileset.link }
					<a
						href={ fileset.link }
						target="_blank"
						rel="noreferrer"
					>{ fileset.source }</a>
				{:else}
					{ fileset.source }
				{/if}
			</div>
		</div>
	</article>
</ion-accordion>
