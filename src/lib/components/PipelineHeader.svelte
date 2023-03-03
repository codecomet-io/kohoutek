<script lang="ts">
	import type { PipelinePostRunData } from '$lib/types/pipeline';

	import SuccessFailIcon from '$lib/components/SuccessFailIcon.svelte';
	import ChunkyLabel from '$lib/components/ChunkyLabel.svelte';


	export let pipeline : PipelinePostRunData;
</script>


<style lang="scss">
	ion-header {
		ion-toolbar {
			padding: var(--ion-padding, 16px);
		}
	}

	.title-container {
		display: flex;
		align-items: center;
	}

	h1 {
		margin-top: 0;
		margin-bottom: 0;
		margin-left: 0.25em;
	}

	.subtitle {
		margin-top: 7px;
		margin-bottom: 0;
	}
</style>


<ion-header translucent={ true }>
  <ion-toolbar class="">
		<div class="title-container">
			<SuccessFailIcon
				success={ pipeline.success }
				subtle={ pipeline.status === 'canceled' }
				size="large"
			/>

			<h1>{ pipeline.title }</h1>
		</div>

		<div class="subtitle">
			<ChunkyLabel>{ pipeline.success ? 'succeed' : 'fail' }ed 5 days ago in { pipeline.elapsedSeconds } seconds</ChunkyLabel>
		</div>
  </ion-toolbar>
</ion-header>
