<script lang="ts">
	import type { Run } from '../../../../pantry/src/lib/model';

	import RunTitleInfo from '$lib/components/RunTitleInfo.svelte';
	import CodeCometLogo from '$lib/components/CodeCometLogo.svelte';
	import TimingChart from '$lib/components/TimingChart.svelte';


	export let run : Run;

	export let anonymous : boolean = false;
</script>


<style lang="scss">
	ion-header {
		margin-bottom: 24px;

		&:not(.anonymous) {
			max-width: 1280px;
			margin-left: auto;
			margin-right: auto;
		}

		&.anonymous {
			background-color: #f7f7f7;
			border-bottom: 0.55px solid rgba(0, 0, 0, 0.2);

			@media (min-width: 1280px) {
				--max-width-gutter-padding: calc((100vw - 1280px) / 2 + 16px);

				padding-left: var(--max-width-gutter-padding);
				padding-right: var(--max-width-gutter-padding);
			}

			@media (prefers-color-scheme: dark) {
				background-color: #0d0d0d;
				border-bottom-color: #262626;
			}
		}
	}

	.top-header-wrapper {
		display: flex;
		gap: 0.5em;

		.anonymous & {
			justify-content: space-between;
			align-items: center;
		}
	}

	:global(.toolbar-container) {
		overflow-x: visible;
	}
</style>


<ion-header class:anonymous={ anonymous }>
	<div class="top-header-wrapper">
		<RunTitleInfo { run } />

		{#if anonymous }
			<CodeCometLogo context="run-header" />
		{/if}
	</div>

	<TimingChart timingInfo={ run?.timingInfo } />
</ion-header>
