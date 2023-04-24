<script lang="ts">
	import type { GroupedLogs } from '../../../../data_importer/lib/model';

	import Prism from 'svelte-prism';
	import 'prismjs/components/prism-bash.min.js';

	import ChunkyLabel from '$lib/components/ChunkyLabel.svelte';
	import LogTooltip from '$lib/components/LogTooltip.svelte';


	export let groupedLogs : GroupedLogs;
	export let count : number;
</script>


<style lang="scss">
	.log-info-container {
		align-items: center;
		padding-top: 5px;
		padding-bottom: 5px;
		display: flex;
		justify-content: space-between;
		max-width: 100vw;
		margin-top: 0;
		margin-bottom: 0;
		padding-left: 16px;
		padding-right: 16px;
		column-gap: 10px;
		background-color: #353b48;

		&:first-child {
			padding-top: 16px;
		}

		&:last-child {
			padding-bottom: 16px;
		}

		@media (min-width: 768px) {
			max-width: none;
			align-items: baseline;
			padding-right: 10px;
			border-top: 1px dashed #666666;

			&:nth-child(-n + 2) {
				border-top: none;
				padding-top: 16px;
			}

			&:nth-last-child(-n + 2) {
				padding-bottom: 16px;
			}
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
</style>


<svelte:head>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.17.1/themes/prism-okaidia.min.css" />
</svelte:head>


<div class="log-info-container">
	<div class="key">
		<ChunkyLabel>command { count }</ChunkyLabel>
	</div>

	<div class="value">
		<Prism
			language="bash"
			source={ groupedLogs.command }
		/>
	</div>

	<LogTooltip groupedLogs={ groupedLogs } />
</div>