<script lang="ts">
	import type { Action, UtilityAction } from '../../../../data_importer/lib/model';

	import { createEventDispatcher } from 'svelte';

	import { parseLapsed, getDateString, getTimeString } from '$lib/helper';

	import StatusIcon from '$lib/components/StatusIcon.svelte';
	import FilesetOrActionTypeIcon from '$lib/components/FilesetOrActionTypeIcon.svelte';
	import ChunkyLabel from '$lib/components/ChunkyLabel.svelte';
	import DetailField from '$lib/components/DetailField.svelte';


	export let action : Action | UtilityAction
	export let highlight : boolean

	const dispatch = createEventDispatcher()

	function handleParentHoverFocus(digest : string, active : boolean) : void {
		dispatch('highlightParent', { digest, active })
	}

	function handleParentClick(digest : string) : void {
		dispatch('expandParent', { digest })
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

		// code to display utility name in accordion header
		// commenting out for now
		// it looks a little too busy and is redundant with info when expanding the accordion
		// ion-label {
		// 	display: flex;

		// 	span {
		// 		+ span {
		// 			&::before {
		// 				content: '|';
		// 				padding-left: 0.5em;
		// 				padding-right: 0.5em;
		// 			}
		// 		}
		// 	}
		// }
	}

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
		}
	}
</style>


<ion-accordion
	value={ action.digest }
	toggle-icon-slot="start"
>
	<ion-item
		slot="header"
		color="light"
		class:ion-focused={ highlight }
	>
		<FilesetOrActionTypeIcon type={ action.type } />

		<ion-label>
			<!--
			// commenting out for now
			// it looks a little too busy and is redundant with info when expanding the accordion
			{#if action.utilityName }
				<span>{ action.utilityName }</span>
			{/if}
			-->

			<span>{ action.name }</span>
		</ion-label>

		{#if action.status === 'cached' }
			<ChunkyLabel>cached</ChunkyLabel>
		{:else if action.runtime }
			<ChunkyLabel
				title={ parseLapsed(action.runtime, false, true) || undefined }
				allcaps={ false }
			>
				{ parseLapsed(action.runtime, true) || '0ms' }
			</ChunkyLabel>
		{/if}

		<StatusIcon status={ action.status } />
	</ion-item>

	<article
		class="ion-padding"
		slot="content"
	>
		<DetailField
			key="type"
			value={ action.utilityName ?? action.type }
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

		<DetailField
			key="{ action.type === 'merge' ? 'merged' : 'parent' } action{ action.parents?.length === 1 ? '' : 's' }"
			customClass="parents-container"
		>
			{#if action.parents?.length }
				<ol data-count={ action.parents.length }>
					{#each action.parents as parentAction }
						<li title={ parentAction.name }>
							<a
								href="#{ parentAction.digest }"
								on:mouseover={ handleParentHoverFocus(parentAction.digest, true) }
								on:mouseout={ handleParentHoverFocus(parentAction.digest, false) }
								on:focus={ handleParentHoverFocus(parentAction.digest, true) }
								on:blur={ handleParentHoverFocus(parentAction.digest, false) }
								on:click={ handleParentClick(parentAction.digest) }
							>{ parentAction.name }</a>
						</li>
					{/each}
				</ol>
			{/if}
		</DetailField>
	</article>
</ion-accordion>
