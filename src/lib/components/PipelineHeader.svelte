<script lang="ts">
	import type { PipelinePostRunData } from '$lib/types/pipeline';

	import { parseLapsed } from '$lib/helper';

	import StatusIcon from '$lib/components/StatusIcon.svelte';
	import ChunkyLabel from '$lib/components/ChunkyLabel.svelte';
	import Ago from '$lib/components/Ago.svelte';


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
			<StatusIcon
				status={ pipeline.status }
				size="large"
			/>

			<h1>{ pipeline.title }</h1>
		</div>

		<div class="subtitle">
			<ChunkyLabel>{ pipeline.status === 'success' ? 'succeed' : 'fail' }ed <Ago date={ pipeline.endedAt } /> <span title="{ pipeline.elapsedSeconds } seconds">in { parseLapsed(pipeline.elapsedSeconds * 1000) }</span></ChunkyLabel>
		</div>
  </ion-toolbar>
</ion-header>
