<script lang="ts">
	import type { Run } from '$pantry/types';

	import RunTitleInfo from '$components/RunTitleInfo.svelte';
	import CodeCometLogo from '$components/CodeCometLogo.svelte';
	import TimingChart from '$components/TimingChart.svelte';


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
			--padding-left-right: var(--padding);

			width: 100vw;
			margin-top: calc(var(--padding) * -1);
			margin-left: calc(var(--padding) * -1);
			padding-top: var(--padding);
			padding-right: var(--padding-left-right);
			padding-bottom: var(--padding);
			padding-left: var(--padding-left-right);
			background-color: #f7f7f7;
			border-bottom: 0.55px solid rgba(0, 0, 0, 0.2);

			@media (min-width: 1280px) {
				--padding-left-right: calc((100vw - 1280px) / 2);
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
			<CodeCometLogo
				context="run-header"
				link="https://codecomet.io/"
			/>
		{/if}
	</div>

	<TimingChart timingInfo={ run?.timingInfo } />
</ion-header>
