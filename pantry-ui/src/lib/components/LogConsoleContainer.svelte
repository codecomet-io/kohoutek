<script lang="ts">
	import type { GroupedLogs } from '../../../../data_importer/src/lib/model';

	import LogConsoleLine from '$lib/components/LogConsoleLine.svelte';


	export let groupedLogs : GroupedLogs;
	export let lineNumberMap : { [ key : string ] : number };
	export let totalLinesLength : number;
</script>


<style lang="scss">
	.log-console-container {
		display: grid;
		grid-template-columns: min-content auto;
		grid-auto-columns: min-content;
		width: 100%;
		align-items: center;
		padding-top: 5px;
		padding-bottom: 5px;
		margin-top: 0;
		margin-bottom: 0;
		padding-right: 16px;
		background-color: #272822;
		color: #fff;
		border-top: 1px dashed #666666;
		border-bottom: 1px dashed #666666;

		&:first-child {
			padding-top: 16px;
		}

		&:last-child {
			padding-bottom: 16px;
			border-bottom: 1px solid #666666;
		}

		@media (min-width: 768px) {
			border-top: 1px dashed #666666;
			border-left: 1px solid #666666;

			&:nth-child(-n + 2) {
				border-top: none;
				padding-top: 16px;
			}

			&:not(:last-child) {
				border-bottom: none;
			}

			&:nth-last-child(-n + 2) {
				padding-bottom: 16px;
			}
		}
	}
</style>


<div class="log-console-container">
	{#each groupedLogs.logs as log, logIndex }
		{#each log.lines as line, lineIndex }
			<LogConsoleLine
				line={ line }
				lineNumber={ lineNumberMap[`${ logIndex }${ lineIndex }`] }
				totalLinesLength={ totalLinesLength }
				isStderr={ log.isStderr ?? false }
				timestamp={ log.timestamp }
			/>
		{/each}
	{/each}
</div>
