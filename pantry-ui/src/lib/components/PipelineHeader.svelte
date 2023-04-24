<script lang="ts">
	import type { Pipeline } from '../../../../data_importer/lib/model';

	import PipelineTitleInfo from '$lib/components/PipelineTitleInfo.svelte';
	import CodeCometLogo from '$lib/components/CodeCometLogo.svelte';
	import TimingChart from '$lib/components/TimingChart.svelte';


	export let pipeline : Pipeline;
</script>


<style lang="scss">
	.max-width-wrapper {
		padding: 16px;
		background-color: #f7f7f7;
		border-bottom: 0.55px solid rgba(0, 0, 0, 0.2);

		@media (prefers-color-scheme: dark) {
			background-color: #0d0d0d;
			border-bottom-color: #262626;
		}

		@media (min-width: 1280px) {
			--max-width-gutter-padding: calc((100vw - 1280px) / 2 + 16px);

			padding-left: var(--max-width-gutter-padding);
			padding-right: var(--max-width-gutter-padding);
		}
	}

	.top-header-wrapper {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5em;
	}

	:global(.toolbar-container) {
		overflow-x: visible;
	}
</style>


<ion-header>
  <div class="max-width-wrapper">
		<div class="top-header-wrapper">
			<PipelineTitleInfo pipeline={ pipeline } />

			<CodeCometLogo />
		</div>

		<TimingChart timingInfo={ pipeline?.timingInfo } />
  </div>
</ion-header>
