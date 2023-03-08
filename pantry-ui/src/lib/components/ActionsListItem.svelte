<script lang="ts">
	import type { Action } from '$lib/types/pipeline';

	import { createEventDispatcher } from 'svelte';

	import { parseDate, parseTime } from '$lib/helper';

	import StatusIcon from '$lib/components/StatusIcon.svelte';
	import ChunkyLabel from '$lib/components/ChunkyLabel.svelte';


	export let action : Action;
	export let highlight : boolean;

	const dispatch = createEventDispatcher();

	function handleSpanwedByHoverFocus(actionId : string, active : boolean) : void {
		dispatch('highlightAction', { actionId, active });
	}
</script>


<style lang="scss">
	[slot="header"] {
		ion-label {
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
			color: #24292f;
			font-size: 16px;
			font-weight: 600;
		}

		ol {
			margin-top: 0;
			margin-bottom: 0;
			padding-inline-start: 1.25em;

			li {
				+ li {
					margin-top: 4px;
				}
			}
		}
	}
</style>


<ion-accordion
	value={ action.id }
	toggle-icon-slot="start"
>
	<ion-item
		slot="header"
		color="light"
		class:ion-focused={ highlight }
	>
		<StatusIcon status={ action.status } />

		<ion-label>{ action.title }</ion-label>

		<ChunkyLabel
			allcaps={ false }
			slot="end"
		>
			{ action.elapsedSeconds }s
		</ChunkyLabel>
	</ion-item>

	<article
		class="ion-padding"
		slot="content"
	>
		<div class="column-container">
			<header class="key">started at</header>

			<div
				class="value"
				title={ parseDate(action.startedAt) }
			>{ parseTime(action.startedAt) }</div>
		</div>

		<div class="column-container">
			<header class="key">ended at</header>

			<div
				class="value"
				title={ parseDate(action.endedAt) }
			>{ parseTime(action.endedAt) }</div>
		</div>

		<div class="column-container">
			<header class="key">status</header>

			<div class="value">{ action.status }</div>
		</div>

		<div class="column-container">
			{#if action.type === 'merge' }
				<header class="key">merged actions</header>

				<ol>
					{#each action.parentAction as parentAction }
						<li>
							<a
								class="value"
								href="#{ parentAction.id }"
								on:mouseover={ handleSpanwedByHoverFocus(parentAction.id, true) }
								on:mouseout={ handleSpanwedByHoverFocus(parentAction.id, false) }
								on:focus={ handleSpanwedByHoverFocus(parentAction.id, true) }
								on:blur={ handleSpanwedByHoverFocus(parentAction.id, false) }
							>{ parentAction.title }</a>
						</li>
					{/each}
				</ol>
			{:else if action.parentAction?.id && action.parentAction?.title }
				<header class="key">parent action</header>

				<a
					class="value"
					href="#{ action.parentAction.id }"
					on:mouseover={ handleSpanwedByHoverFocus(action.parentAction.id, true) }
					on:mouseout={ handleSpanwedByHoverFocus(action.parentAction.id, false) }
					on:focus={ handleSpanwedByHoverFocus(action.parentAction.id, true) }
					on:blur={ handleSpanwedByHoverFocus(action.parentAction.id, false) }
				>{ action.parentAction.title }</a>
			{/if}
		</div>
	</article>
</ion-accordion>
