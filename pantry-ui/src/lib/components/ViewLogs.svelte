<script lang="ts">
	import type { FilesetAction, Action } from '../../../../data_importer/lib/model'

	import Prism from 'svelte-prism'
	import 'prismjs/components/prism-bash.min.js'
	import 'prismjs/components/prism-shell-session.min.js'

	import { receiptOutline } from 'ionicons/icons'

	import { gotoSearchString } from '$lib/helper'

	import ChunkyLabel from '$lib/components/ChunkyLabel.svelte'
	import LogTooltip from '$lib/components/LogTooltip.svelte'


	export let item : FilesetAction | Action
	export let activeModal : string
	export let highlightLine : string

	$: parseHighlight(highlightLine)

	let modalElement : HTMLIonModalElement

	function updateModalAndTooltip(modalElement : HTMLElement) : void {
		const scrollWrapper = modalElement.querySelector('ion-content .scroll-wrapper') as HTMLElement

		setModalHeight(modalElement, scrollWrapper)

		checkTooltipPosition(scrollWrapper)
	}

	function setModalHeight(modalElement : HTMLElement, scrollWrapper : HTMLElement) : void {
		if (modalElement.style.getPropertyValue('--height')) {
			return
		}

		const scrollWrapperHeight = (scrollWrapper.offsetHeight - scrollWrapper.clientHeight + scrollWrapper.scrollHeight) || 0

		const header = modalElement.querySelector('ion-header') as HTMLElement
		const headerHeight = header?.offsetHeight ?? 0

		modalElement.style.setProperty('--height', `${ headerHeight + scrollWrapperHeight }px`)
	}

	function checkTooltipPosition(scrollWrapper : HTMLElement) : void {
		const tooltipWrappers : NodeListOf<Element> = scrollWrapper.querySelectorAll('.tooltip-wrapper')

		if (!(tooltipWrappers && tooltipWrappers.length)) {
			return
		}

		tooltipWrappers.forEach((item : Element) => {
			const tooltipWrapper = item as HTMLElement

			const tooltip : HTMLElement | null = tooltipWrapper.querySelector('.tooltip')

			if (!tooltip) {
				return
			}

			const bottomOfTooltip =
				tooltipWrapper.offsetTop
				+ tooltipWrapper.offsetHeight
				+ tooltip.offsetHeight
				+ 50 // we should clear the bottom of the modal by at least 50 pixels

				if (bottomOfTooltip <= scrollWrapper.offsetHeight) {
					setTooltipChecked(tooltipWrapper)

					return
				}

				tooltipWrapper.classList.remove('default-position')

				setTooltipChecked(tooltipWrapper)
		})
	}

	function setTooltipChecked(tooltipWrapper : HTMLElement) : void {
		tooltipWrapper.style.overflow = 'visible'
	}

	function handleWillPresent(event : any, id : string, active : boolean) : void {
		updateActiveModal(id, true)

		setTimeout(() => updateModalAndTooltip(event.target), 1)
	}

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

	let highlightBounds : [ number, number ]
	let highlightMap : { [ key : string ] : true } = {}

	function parseHighlight(updatedHighlight : string) : void {
		if (updatedHighlight) {
			// does highlight contain a dash, indicating a range
			// if so, parse the upper and lower bounds
			if (/-/.test(updatedHighlight)) {
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

		// wait a beat for updated search params to flow down
		// and for the reactive parseHighlight func to update highlightBounds
		setTimeout(() => selectText(event), 100)
	}

	function selectText(event : MouseEvent) : void {
		const container = (event.target as HTMLElement)?.closest('.log-container')

		if (!container) {
			return
		}

		const startBeforeNode = container.querySelector(`a[data-line="${ highlightBounds[0] }"] + code + pre`)
		const endAfterNode = container.querySelector(`a[data-line="${ highlightBounds[1] }"] + code + pre`)

		if (!(startBeforeNode && endAfterNode)) {
			return
		}

		const range = new Range()

		range.setStartBefore(startBeforeNode)

		range.setEndAfter(endAfterNode)

		const selection = window.getSelection()

		if (!selection) {
			return
		}

		selection.removeAllRanges()

		selection.addRange(range)
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
		--min-height: 100vh;
		--max-height: 100vh;

		@media (min-width: 768px) {
			--width: calc(100vw - (16px * 2));
			--max-width: calc(1280px - (16px * 2));
			--min-height: calc(50vh - (16px * 2));
			--max-height: calc(100vh - (16px * 2));
		}
	}

	ion-content {
		--background: #353b48;
	}

	.scroll-wrapper {
		height: 100%;
		overflow-x: auto;
	}

	.log-container {
		position: relative;
		min-width: fit-content;

		@media (min-width: 768px) {
			display: grid;
			grid-template-columns: minmax(200px, 40%) auto;
		}

		@media (min-width: 1280px) {
			grid-template-columns: min-content auto;
		}

		:global(pre) {
			width: min-content;
			margin-top: 0;
			margin-bottom: 0;
			padding: 0 0.25em;
			overflow: visible;
		}
	}

	.log-info-container,
	.log-console-container {
		align-items: center;
		padding-top: 5px;
		padding-bottom: 5px;

		&:first-child {
			padding-top: 16px;
		}

		&:last-child {
			padding-bottom: 16px;
		}

		@media (min-width: 768px) {
			border-top: 1px dashed #666666;

			&:nth-child(-n + 2) {
				border-top: none;
				padding-top: 16px;
			}

			&:nth-last-child(-n + 2) {
				padding-bottom: 16px;
			}
		}
	}

	.log-info-container {
		display: flex;
		justify-content: space-between;
		max-width: 100vw;
		margin-top: 0;
		margin-bottom: 0;
		padding-left: 16px;
		padding-right: 16px;
		column-gap: 10px;
		background-color: #353b48;

		@media (min-width: 768px) {
			max-width: none;
			align-items: baseline;
			padding-right: 10px;
		}

		&::-webkit-scrollbar {
			display: none;
		}

		:global(.tooltip-wrapper) {
			flex-grow: 0;
			flex-shrink: 0;
		}
	}

	.key {
		flex-grow: 0;
		flex-shrink: 0;

		:global(ion-card-subtitle) {
			--color: #ffeaa7;
		}
	}

	.value {
		margin-left: 0;
		overflow: hidden;
		flex-grow: 1;
		flex-shrink: 1;

		@media (min-width: 768px) {
			display: none;
		}

		@media (min-width: 1024px) {
			display: block;
		}

		:global(pre) {
			background-color: unset;
		}
	}

	.log-console-container {
		display: grid;
		grid-template-columns: min-content auto;
		grid-auto-columns: min-content;
		width: 100%;
		list-style: none;
		margin-top: 0;
		margin-bottom: 0;
		padding-right: 16px;
		background-color: #272822;
		color: #fff;
		border-top: 1px dashed #666666;
		border-bottom: 1px dashed #666666;

		&:last-child {
			border-bottom: 1px solid #666666;
		}

		@media (min-width: 768px) {
			border-left: 1px solid #666666;

			&:not(:last-child) {
				border-bottom: none;
			}
		}
	}

	.line-link {
		padding: 5px 10px;
		text-decoration: none;
		text-align: right;
		position: relative;

		&.highlight {
			&::after {
				content: '';
				position: absolute;
				top: 0;
				right: 5px;
				width: 2px;
				height: 100%;
				background-color: #f1c40f;
			}

			+ :global(code + pre) {
				background-color: rgba(115, 255, 0, 40%);
			}
		}

		&.stderr {
			:global(ion-card-subtitle) {
				--color: #eb445a;
			}
		}

		:global(ion-card-subtitle) {
			display: flex;
			pointer-events: none;
		}

		.spacing-digits,
		.visible-digits {
			pointer-events: none;
		}

		.spacing-digits {
			visibility: hidden;
		}

		.visible-digits {
			&::before {
				content: attr(data-line-count);
			}
		}
	}

	.stderr-badge {
		grid-column: 3;
		margin-left: 0.5em;
	}
</style>


<svelte:head>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.17.1/themes/prism-okaidia.min.css" />
</svelte:head>


{#if item.groupedLogs }
	<div class="view-logs-button-wrapper">
		<ion-button
			id="{ item.id }_openLogsModal"
			fill={ item.status === 'errored' ? 'solid' :'outline' }
			color={ item.status === 'errored' ? 'danger' :'default' }
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
		on:willPresent={ (event) => handleWillPresent(event, item.id, true) }
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
			<div class="scroll-wrapper">
				<div class="log-container">
					{#each item.groupedLogs.commands ?? [] as groupedLogs, groupedIndex }
						<div class="log-info-container">
							<div class="key">
								<ChunkyLabel>command { groupedIndex + 1 }</ChunkyLabel>
							</div>

							<div class="value">
								<Prism
									language="bash"
									source={ groupedLogs.command }
								/>
							</div>

							<LogTooltip groupedLogs={ groupedLogs } />
						</div>

						<div class="log-console-container">
							{#each groupedLogs.logs as log, logIndex }
								{#each log.lines as line, lineIndex }
									{@const lineCount = getLineCount(`${ groupedIndex }${ logIndex }${ lineIndex }`) }

									<a
										class="line-link"
										aria-label="highlight line { lineCount }"
										class:highlight={ highlightMap[lineCount] }
										class:stderr={ log.isStderr }
										href="#{ lineCount }"
										data-line={ lineCount }
										data-timestamp={ lineIndex === 0 ? log.timestamp : null }
										on:click|preventDefault={ (event) => handleHighlightLineClick(event, lineCount) }
									>
										<ChunkyLabel>
											<span
												class="spacing-digits"
												aria-hidden="true"
											>{ insertSpacingDigits(lineCount) }</span>

											<span
												class="visible-digits"
												data-line-count={ lineCount }
												aria-hidden="true"
											></span>
										</ChunkyLabel>
									</a>

									<Prism
										language="shell-session"
										source={ line }
									/>

									{#if log.isStderr }
										<ion-badge
											class="stderr-badge"
											color="danger"
										>StdErr</ion-badge>
									{/if}
								{/each}
							{/each}
						</div>
					{/each}
				</div>
			</div>
		</ion-content>
	</ion-modal>
{/if}
