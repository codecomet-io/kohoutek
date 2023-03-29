<script lang="ts">
	import type { FilesetAction, Action } from '../../../../data_importer/lib/model'

	import Prism from 'svelte-prism'
	import 'prismjs/components/prism-shell-session.min.js'

	import { receiptOutline } from 'ionicons/icons'

	import { gotoSearchString } from '$lib/helper'

	import ChunkyLabel from '$lib/components/ChunkyLabel.svelte'


	export let item : FilesetAction | Action
	export let activeModal : string
	export let highlightLine : string

	$: parseHighlight(highlightLine)

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

	function getLineCount(lineId : string) : string {
		if (_lineMap[lineId] == null) {
			_lineMap[lineId] = ++_lineCount
		}

		return _lineMap[lineId].toString()
	}

	let highlightIsRange : boolean
	let highlightBounds : [ number, number ]
	let highlightMap : { [ key : string ] : true } = {}

	function parseHighlight(updatedHighlight : string) : void {
		if (updatedHighlight) {
			// does highlight contain a dash, indicating a range
			highlightIsRange = /-/.test(updatedHighlight)

			// if so, parse the upper and lower bounds
			if (highlightIsRange) {
				highlightBounds = updatedHighlight
					.split('-')
					.map((item : string) => parseInt(item, 10)) as [ number, number ]
			} else {
				const lineNumber = parseInt(updatedHighlight, 10)

				highlightBounds = [lineNumber, lineNumber]
			}

			const highlightCount = highlightBounds[1] - highlightBounds[0] + 1

			const highlightEntries = Array
				.from(Array(highlightCount), (_, i) => i + highlightBounds[0])
				.map((item : number) => [ item, true ])

			highlightMap = Object.fromEntries(highlightEntries)
		} else {
			highlightMap = {}
		}
	}

	function handleHighlightLineClick(event : MouseEvent, line : string) : void {
		let value : string | undefined = undefined

		if (highlightLine !== line) {
			if (highlightLine && event.shiftKey) {
				const lineNumber = parseInt(line, 10)

				if (lineNumber === highlightBounds[0] || lineNumber === highlightBounds[1]) {
					return
				} else if (lineNumber < highlightBounds[0]) {
					value = `${ line }-${ highlightBounds[1] }`
				} else {
					value = `${ highlightBounds[0] }-${ line }`
				}
			} else {
				value = line
			}
		}

		gotoSearchString('highlight_line', value)
	}

	$: totalLinesLength = item.groupedLogs?.totalLines.toString().length

	// insure each line number is as long as the last line number for even alignment
	// to do this we compare the length of the total lines number to the current line
	// if necessary we insert zeros ("0"), which will be hidden, to balance the number
	function insertSpacingDigits(line : string) : string {
		const lineLength : number = line.length

		if (!totalLinesLength || totalLinesLength === lineLength) {
			return ''
		}

		// taking 10 to the power of the number of digits we need,
		// aka total lines length minus current line length,
		// will give us a 1 followed by the needed zeros
		// remove the 1 and return
		return (10 ** (totalLinesLength - lineLength))
			.toString()
			.replace(/[^0]/, '')
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

	.log-container,
	.log-info-container,
	.console-container {
		display: grid;
		grid-template-columns: min-content auto;
	}

	.log-container {
		overflow-x: auto;
		// background-color: #272822;
		color: #fff;

		:global(pre) {
			margin-top: 0;
			margin-bottom: 0;
			padding: 0;
			background-color: unset;
		}
	}

	.log-info-container,
	.console-container {
		align-items: baseline;

		&:nth-child(-n + 2) {
			padding-top: 16px;
		}

		&:not(:nth-child(-n + 2)) {
			padding-top: 5px;
			border-top: 1px dashed #666666;
		}

		&:nth-last-child(-n + 2) {
			padding-bottom: 16px;
		}

		&:not(:nth-last-child(-n + 2)) {
			padding-bottom: 5px;
		}
	}

	.log-info-container {
		margin-top: 0;
		margin-bottom: 0;
		padding-left: 16px;
		padding-right: 10px;
		column-gap: 0.5em;
		background-color: #353b48;
	}

	dt {
		font-size: 12px;
		color: #ffeaa7;
		text-align: right;
	}

	dd {
		margin-left: 0;
	}

	.non-zero-exit-code {
		:global(code) {
			color: #eb445a;
		}
	}

	.console-container {
		width: 100%;
		// width: fit-content;
		list-style: none;
		margin-top: 0;
		margin-bottom: 0;
		padding-right: 16px;
		background-color: #272822;
		color: #fff;
		border-left: 1px solid #666666;
	}

	.line-link {
		padding: 5px 11px 5px 10px;
		text-decoration: none;
		text-align: right;

		&.highlight {
			+ :global(code + pre) {
				background-color: #4d709e;
			}
		}

		&.stderr {
			position: relative;

			:global(ion-card-subtitle) {
				--color: #eb445a;
			}

			&::after {
				content:'\25B6';
				position: absolute;
				top: 50%;
				right: 1px;
				transform: translateY(-50%);
				color: #eb445a;
				font-size: 12px;
			}
		}

		.spacing-digits {
			visibility: hidden;
		}
	}
</style>


<svelte:head>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.17.1/themes/prism-okaidia.min.css" />
</svelte:head>


{#if item.groupedLogs }
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
				{#each item.groupedLogs.commands ?? [] as groupedLog, groupedIndex }
					<dl class="log-info-container">
						<dt>command</dt>

						<dd>
							<Prism
								language="shell-session"
								source={ groupedLog.command }
							/>
						</dd>

						{#if groupedLog.resolved !== groupedLog.command }
							<dt>resolved</dt>

							<dd>
								<Prism
									language="shell-session"
									source={ groupedLog.resolved }
								/>
							</dd>
						{/if}

						{#if groupedLog.exitCode !== 0 }
							<dt>exit code</dt>

							<dd class="non-zero-exit-code">
								<Prism
									language="shell-session"
									source={ groupedLog.exitCode + '' }
								/>
							</dd>
						{/if}
					</dl>

					<div class="console-container">
						{#each groupedLog.logs as log, logIndex }
							{#each log.lines as line, lineIndex }
								{@const lineCount = getLineCount(`${ groupedIndex }${ logIndex }${ lineIndex }`) }

								<a
									class="line-link"
									class:highlight={ highlightMap[lineCount] }
									class:stderr={ log.isStderr }
									href="#{ lineCount }"
									data-timestamp={ lineIndex === 0 ? log.timestamp : null }
									on:click|preventDefault={ (event) => handleHighlightLineClick(event, lineCount) }
								>
									<!--
										the following line must all be together on 1 line
										otherwise we'll need additional CSS properties to remove white space
									-->
									<ChunkyLabel><span class="spacing-digits">{ insertSpacingDigits(lineCount) }</span>{ lineCount }</ChunkyLabel>
								</a>

								<Prism
									language="shell-session"
									source={ line }
								/>
							{/each}
						{/each}
					</div>
				{/each}
			</div>
		</ion-content>
	</ion-modal>
{/if}
