<script lang="ts">
	import type { FilesetAction, Action } from '../../../../data_importer/lib/model'

	import Prism from 'svelte-prism'
	import 'prismjs/components/prism-shell-session.min.js'

	import { receiptOutline } from 'ionicons/icons'

	import { isPopulated, createId } from '$lib/helper'

	import ChunkyLabel from '$lib/components/ChunkyLabel.svelte'


	type UnifiedLog = {
		timestamp: number
		line: string
		isError?: boolean
	}


	export let item : FilesetAction | Action

	const id = createId('html')

	let modalElement : HTMLIonModalElement

	function handleCloseModal() : void {
		modalElement.dismiss(null, 'cancel')
	}

	function parseUnifiedLogs(stdout : any[] = [], stderr : any[] = []) : UnifiedLog[] {
		const unifiedErrors = stderr.map((item) => ({
			...item,
			isError : true
		}))

		return stdout.concat(unifiedErrors)
			.sort((a, b) => a.timestamp - b.timestamp)
			.map((item) => ({
				...item,
				line : (item.line ?? '').trim()
			}))
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

	ol {
		list-style: none;
		margin-top: 0;
		margin-bottom: 0;
		padding: 1em 1em 1em 0;
		background-color: #000;
		color: #fff;
		overflow-x: auto;

		:global(pre) {
			overflow: visible;
			margin-top: 0;
			margin-bottom: 0;
		}
	}

	li {
		display: flex;
		align-items: center;
		width: fit-content;
	}

	.line-link {
		flex-shrink: 1;
		flex-basis: 0%;
		text-decoration: none;
		min-width: 44px;
		margin-right: 0.5em;
		text-align: right;
	}
</style>


{#if isPopulated(item.stdout) || isPopulated(item.stderr) }
	<div class="view-logs-button-wrapper">
		<ion-button
			id="{ id }_openLogsModal"
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
		trigger="{ id }_openLogsModal"
		bind:this={ modalElement }
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
			<ol>
				{#each parseUnifiedLogs(item.stdout, item.stderr) as log, index }
					<li>
						<a
							class="line-link"
							href="#"
						>
							<ChunkyLabel>{ index + 1 }</ChunkyLabel>
						</a>

						<Prism
							language="shell-session"
							source={ log.line }
						/>
					</li>
				{/each}
			</ol>
		</ion-content>
	</ion-modal>
{/if}
