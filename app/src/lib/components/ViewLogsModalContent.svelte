<script lang="ts">
	import type { FilesetAction, Action, GroupedLogs } from '../../../../pantry/src/lib/model';

	import LogInfoContainer from '$lib/components/LogInfoContainer.svelte';
	import LogConsoleContainer from '$lib/components/LogConsoleContainer.svelte';


	export let item : FilesetAction | Action;

	$: parseLineNumberMap();

	let lineNumberMapArr : { [ key : string ] : number }[] = [];

	function parseLineNumberMap() : void {
		if (!item?.groupedLogs?.commands) {
			return;
		}

		let lineCount : number = 0;

		lineNumberMapArr = item.groupedLogs.commands.map((groupedLogs : GroupedLogs) => {
			const lineNumberMap : { [ key : string ] : number } = {};

			groupedLogs.logs.forEach((log : any, logIndex : number) => {
				log.lines.forEach((line : string, lineIndex : number) => {
					lineNumberMap[`${ logIndex }${ lineIndex }`] = ++lineCount;
				});
			});

			return lineNumberMap;
		});
	}
</script>


<style lang="scss">
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
			grid-template-columns: 33% auto;
		}

		:global(pre) {
			width: min-content;
			margin-top: 0;
			margin-bottom: 0;
			padding: 0 0.25em;
			overflow: visible;
		}
	}
</style>


{#if item.groupedLogs }
	<ion-content>
		<div class="scroll-wrapper">
			<div class="log-container">
				{#each item.groupedLogs.commands ?? [] as groupedLogs, groupedIndex }
					<LogInfoContainer
						groupedLogs={ groupedLogs }
						count={ groupedIndex + 1 }
					/>

					<LogConsoleContainer
						groupedLogs={ groupedLogs }
						lineNumberMap={ lineNumberMapArr[groupedIndex] }
						totalLinesLength={ item.groupedLogs.totalLines.toString().length }
					/>
				{/each}
			</div>
		</div>
	</ion-content>
{/if}
