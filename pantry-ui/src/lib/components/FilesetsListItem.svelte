<script lang="ts">
	import type { FilesetAction } from '../../../../data_importer/lib/model';

	import FilesetOrActionTypeIcon from '$lib/components/FilesetOrActionTypeIcon.svelte';
	import StatusIcon from '$lib/components/StatusIcon.svelte';
	import ChunkyLabel from '$lib/components/ChunkyLabel.svelte';


	export let fileset : FilesetAction
	export let highlight : boolean

	// support GitLab icon for GitLab-hosted filesets
	let icon : 'gitlab'

	$: if (fileset?.filesetType === 'git' && /\/\/(?:www\.)?gitlab\.com\//.test(fileset?.source)) {
		icon = 'gitlab'
	}
</script>


<style lang="scss">
	[slot="header"] {
		:global(.fileset-or-action-type-icon) {
			margin-right: 0.25em;
		}

		:global(.status-icon) {
			margin-left: 0.25em;
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

		&.source-container {
			min-width: 50%;
		}

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
	value={ fileset.digest }
	toggle-icon-slot="start"
>
	<ion-item
		slot="header"
		color="light"
		class:ion-focused={ highlight }
	>
		<FilesetOrActionTypeIcon
			slot="start"
			type={ fileset.filesetType }
			icon={ icon }
		/>

		<ion-label>{ fileset.name }</ion-label>

		{#if fileset.status === 'cached' }
			<ChunkyLabel slot="end">cached</ChunkyLabel>
		{/if}

		<StatusIcon
			slot="end"
			status={ fileset.status }
		/>
	</ion-item>

	<article
		class="ion-padding"
		slot="content"
	>
		<div class="column-container">
			<header class="key">type</header>

			<div class="value">{ fileset.filesetType }</div>
		</div>

		<div class="column-container">
			<header class="key">status</header>

			<div class="value">{ fileset.status === 'completed' || fileset.status === 'cached' ? 'successfully retrieved' : 'failed to retrieve' }</div>
		</div>

		<div
			class="column-container source-container"
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
