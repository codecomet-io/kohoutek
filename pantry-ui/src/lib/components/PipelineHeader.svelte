<script lang="ts">
	import type { Pipeline } from '../../../../data_importer/lib/model'

	import PipelineTitleInfo from '$lib/components/PipelineTitleInfo.svelte'
	import CodeCometLogo from '$lib/components/CodeCometLogo.svelte'


	export let pipeline : Pipeline
</script>


<style lang="scss">
	ion-header {
		ion-toolbar {
			padding: var(--ion-padding, 16px);

			@media (min-width: 1280px) {
				--max-width-gutter-padding: calc((100vw - 1280px) / 2 + 16px);

				padding-left: var(--max-width-gutter-padding);
				padding-right: var(--max-width-gutter-padding);
			}
		}
	}

	.header-wrapper {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5em;
	}
</style>


<ion-header translucent={ true }>
  <ion-toolbar>
		<div class="header-wrapper">
			<PipelineTitleInfo pipeline={ pipeline } />

			<CodeCometLogo />
		</div>
  </ion-toolbar>
</ion-header>
