<script lang="ts">
	import type { FilesetAction, Action } from '../../../../data_importer/lib/model'

	import Prism from 'svelte-prism'
	import 'prismjs/components/prism-shell-session.min.js'

	import { receiptOutline } from 'ionicons/icons'

	import { isPopulated, gotoSearchString } from '$lib/helper'

	import ChunkyLabel from '$lib/components/ChunkyLabel.svelte'


	export let item : FilesetAction | Action
	export let activeModal : string
	export let highlightLine : number

	let modalElement : HTMLIonModalElement

	function updateActiveModal(id : string, active : boolean) : void {


		if (active) {
			gotoSearchString('active_modal', id)
		} else {
			gotoSearchString({
				'active_modal' : undefined,
				'highlight_line' : undefined,
			})
		}
	}

	function handleCloseModal() : void {
		modalElement.dismiss(null, 'cancel')
	}

	let _lineCount : number = 0

	const _lineMap : { [ key : string ] : number } = {}

	function getLineCount(lineId : string) : number {
		if (_lineMap[lineId] == null) {
			_lineMap[lineId] = ++_lineCount
		}

		return _lineMap[lineId]
	}

	function handleHighlightLineClick(line : number) : void {
		gotoSearchString('highlight_line', highlightLine !== line ? line.toString() : undefined)
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

		&.highlight {
			:global(pre) {
				background-color: #4d709e;
			}
		}
	}

	.line-link {
		flex-shrink: 1;
		flex-basis: 0%;
		text-decoration: none;
		min-width: 44px;
		margin-right: 0.5em;
		padding-right: 0.5em;
		text-align: right;

		&.stderr {
			position: relative;

			:global(ion-card-subtitle) {
				--color: #eb445a;
			}

			&::after {
				content:'\25B6';
				position: absolute;
				top: 50%;
				right: -5px;
				transform: translateY(-50%);
				color: #eb445a;
				font-size: 13px;
			}
		}
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
				{#each item.groupedLogs ?? [] as groupedLog, groupedIndex }
					<ol>
						{#each groupedLog.logs as log, logIndex }
							{#each log.lines as line, lineIndex }
								{@const lineCount = getLineCount(`${ groupedIndex }${ logIndex }${ lineIndex }`) }

								<li class:highlight={ highlightLine === lineCount }>
									<a
										class="line-link"
										class:stderr={ log.isStderr }
										href="#{ lineCount }"
										data-timestamp={ lineIndex === 0 ? log.timestamp : null }
										on:click|preventDefault={ () => handleHighlightLineClick(lineCount) }
									>
										<ChunkyLabel>{ lineCount }</ChunkyLabel>
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
