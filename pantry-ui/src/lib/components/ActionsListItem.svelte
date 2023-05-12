<script lang="ts">
	import type { Action, UtilityAction } from '../../../../data_importer/src/lib/model';

	import { getDateString, getTimeString } from 'briznads-helpers';

	import { gotoSearchString } from '$lib/helper';

	import { highlightAccordion } from '$lib/stores';

	import FilesetOrActionAccordionHeader from '$lib/components/FilesetOrActionAccordionHeader.svelte';
	import DetailField from '$lib/components/DetailField.svelte';
	import ViewLogs from '$lib/components/ViewLogs.svelte';


	export let action : Action | UtilityAction;

	$: nameOrType = (action as UtilityAction).utilityName ?? action.type;

	function handleParentHoverFocus(id? : string) : void {
		highlightAccordion.set(id ?? '');
	}

	function handleParentClick(id : string) : void {
		gotoSearchString('active_accordion', id);
	}
</script>


<style lang="scss">
	article {
		display: flex;
		flex-wrap: wrap;
		gap: 1em;

		:global(.parents-container) {
			min-width: 50%;

			@media (min-width: 768px) {
				min-width: calc(1 / 3 * 100% );
			}
		}
	}

	ol {
		margin-top: 0;
		margin-bottom: 0;
		padding-inline-start: 1.25em;

		&[data-count="1"] {
			list-style: none;
			padding-inline-start: 0;
		}

		li {
			+ li {
				margin-top: 4px;
			}
		}

		a {
			display: block;
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
			color: #24292f;

			@media (prefers-color-scheme: dark) {
				color: #dbd6d0;
			}
		}
	}
</style>


<ion-accordion
	value={ action.id }
	data-id={ action.id }
	toggle-icon-slot="start"
>
	<ion-item
		slot="header"
		color="light"
		class:ion-focused={ action.id === $highlightAccordion }
	>
		<FilesetOrActionAccordionHeader item={ action } />
	</ion-item>

	<article
		class="ion-padding"
		slot="content"
	>
		<DetailField
			key="type"
			value={ nameOrType }
		/>

		<DetailField
			key="status"
			value={ action.status }
		/>

		<DetailField
			key="started at"
			value={ action.started ? getTimeString(action.started) : undefined }
			title={ action.started ? getDateString(action.started) : undefined }
		/>

		<DetailField
			key="ended at"
			value={ action.completed ? getTimeString(action.completed) : undefined }
			title={ action.completed ? getDateString(action.completed) : undefined }
		/>

		{#if action.parents?.length }
			<DetailField
				key="{ action.type === 'merge' ? 'merged' : 'parent' } action{ action.parents?.length === 1 ? '' : 's' }"
				customClass="parents-container"
			>
				<ol data-count={ action.parents.length }>
					{#each action.parents as parentAction }
						<li title={ parentAction.name }>
							<a
								href="#{ parentAction.id }"
								on:mouseover={ () => handleParentHoverFocus(parentAction.id) }
								on:mouseout={ () => handleParentHoverFocus() }
								on:focus={ () => handleParentHoverFocus(parentAction.id) }
								on:blur={ () => handleParentHoverFocus() }
								on:click|preventDefault={ () => handleParentClick(parentAction.id) }
							>{ parentAction.name }</a>
						</li>
					{/each}
				</ol>
			</DetailField>
		{:else}
			<DetailField
				key=""
				customClass="parents-container"
			/>
		{/if}

		<ViewLogs item={ action } />
	</article>
</ion-accordion>
