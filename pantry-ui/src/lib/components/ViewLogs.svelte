<script lang="ts">
	import type { FilesetAction, Action } from '../../../../data_importer/lib/model'

	import Prism from 'svelte-prism'
	import 'prismjs/components/prism-shell-session.min.js'

	import { receiptOutline } from 'ionicons/icons'

	import { isPopulated, gotoSearchString } from '$lib/helper'

	import ChunkyLabel from '$lib/components/ChunkyLabel.svelte'


	export let item : FilesetAction | Action
	export let activeModal : string

	let modalElement : HTMLIonModalElement

	function updateActiveModal(id : string, active : boolean) : void {
		gotoSearchString('active_modal', active ? id : undefined)
	}

	function handleCloseModal() : void {
		modalElement.dismiss(null, 'cancel')
	}

	let lineCount : number = 0

	function getLineCount() : number {
		return ++lineCount
	}
</script>


<style lang="scss">
	.view-logs-button-wrapper {
		display: flex;
		justify-content: right;
		flex-grow: 1;
		flex-basis: 0%;
	}

	ion-modal {
		@media (min-width: 768px) {
			--width: calc(100vw - (16px * 2));
			--max-width: calc(1280px - (16px * 2));
		}
	}

	.log-container {
		overflow-x: auto;
		padding: 16px 16px 16px 0;
		background-color: #272822;
		color: #fff;
	}

	ol,
	li {
		width: fit-content;
	}

	ol {
		list-style: none;
		margin-top: 0;
		margin-bottom: 0;
		padding-left: 0;

		:global(pre) {
			margin-top: 0;
			margin-bottom: 0;
			padding: 0;
		}
	}

	li {
		display: flex;
		align-items: center;
	}

	.line-link {
		flex-shrink: 1;
		flex-basis: 0%;
		text-decoration: none;
		min-width: 44px;
		margin-right: 0.5em;
		padding-right: 0.5em;
		text-align: right;
	}
</style>


<svelte:head>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.17.1/themes/prism-okaidia.min.css" />
</svelte:head>


{#if isPopulated(item.groupedLogs) }
	<div class="view-logs-button-wrapper">
		<ion-button
			id="{ item.id }_openLogsModal"
			fill="outline"
			size="small"
		>
			View Logs

			<ion-icon
				slot="start"
				icon={ receiptOutline }
			></ion-icon>
		</ion-button>
	</div>

	<ion-modal
		trigger="{ item.id }_openLogsModal"
		bind:this={ modalElement }
		is-open={ item.id === activeModal }
		on:willPresent={ () => updateActiveModal(item.id, true) }
		on:willDismiss={ () => updateActiveModal(item.id, false) }
	>
		<ion-header>
			<ion-toolbar>
				<ion-title>View Logs</ion-title>

				<ion-buttons slot="end">
					<ion-button
						fill="clear"
						on:click={ handleCloseModal }
						on:keypress={ handleCloseModal }
					>
						Close
					</ion-button>
				</ion-buttons>
			</ion-toolbar>
		</ion-header>

		<ion-content>
			<div class="log-container">
				{#each item.groupedLogs ?? [] as groupedLog }
					<ol>
						{#each groupedLog.logs as log }
							{#each log.lines as line, lineIndex }
								<li>
									<a
										class="line-link"
										href="#"
										data-timestamp={ lineIndex === 0 ? log.timestamp : null }
									>
										<ChunkyLabel>{ getLineCount() }</ChunkyLabel>
									</a>

									<Prism
										language="shell-session"
										source={ line }
									/>
								</li>
							{/each}
						{/each}
					</ol>
				{/each}
			</div>
		</ion-content>
	</ion-modal>
{/if}
