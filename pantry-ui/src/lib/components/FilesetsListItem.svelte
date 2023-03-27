<script lang="ts">
	import type { FilesetAction } from '../../../../data_importer/lib/model';

	import FilesetOrActionAccordionHeader from '$lib/components/FilesetOrActionAccordionHeader.svelte';
	import FilesetSpecialFields from '$lib/components/FilesetSpecialFields.svelte';
	import DetailField from '$lib/components/DetailField.svelte';
	import ViewLogs from '$lib/components/ViewLogs.svelte';


	export let fileset : FilesetAction
	export let highlight : boolean
</script>


<style lang="scss">
	article {
		display: flex;
		flex-wrap: wrap;
		gap: 1em;

		:global(.source-container) {
			min-width: 50%;

			@media (min-width: 768px) {
				min-width: calc(1 / 3 * 100% );
			}
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
	data-digest={ fileset.digest }
	toggle-icon-slot="start"
>
	<ion-item
		slot="header"
		color="light"
		class:ion-focused={ highlight }
	>
		<FilesetOrActionAccordionHeader item={ fileset } />
	</ion-item>

	<article
		class="ion-padding"
		slot="content"
	>
		<DetailField
			key="type"
			value={ fileset.filesetType }
		/>

		<DetailField
			key="status"
			value={ fileset.status === 'completed' || fileset.status === 'cached'
				? 'successfully retrieved'
				: 'failed to retrieve'
			}
		/>

		<FilesetSpecialFields fileset={ fileset } />

		<DetailField
			key="source"
			title={ fileset.source }
			customClass="source-container"
		>
			{#if fileset.link }
				<a
					href={ fileset.link }
					target="_blank"
					rel="noreferrer"
				>{ fileset.source }</a>
			{:else}
				{ fileset.source }
			{/if}
		</DetailField>

		<ViewLogs item={ fileset } />
	</article>
</ion-accordion>
