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

	.corp-site-link {
		display: flex;
		height: 2rem;
		align-items: center;
		color: #1c1e21;
		text-decoration: none;
		font-family: system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";

		&:hover {
			color: #5468ff;

			img {
				transform: translateX(-2px) translateY(2px) scale(110%);
			}
		}

		img {
			height: 100%;
			margin-right: 0.25rem;
			transition: transform 125ms ease-in-out;
		}
	}
</style>


<ion-header translucent={ true }>
  <ion-toolbar>
		<div class="title-container">
			<StatusIcon
				status={ pipeline.status }
				size="large"
			/>

			<h1>{ pipeline.title }</h1>
		</div>

		<div class="subtitle">
			<ChunkyLabel>{ pipeline.status === 'completed' ? 'succeed' : 'fail' }ed <Ago date={ pipeline.endedAt } /> <span title="{ pipeline.elapsedSeconds } seconds">in { parseLapsed(pipeline.elapsedSeconds * 1000) }</span></ChunkyLabel>
		</div>

		<a
			slot="end"
			class="corp-site-link"
			href="https://codecomet.io/"
			itemtype="http://schema.org/Corporation"
			itemscope
		>
			<img
				src="/CodeComet-logo.svg"
				alt="CodeComet logo showing an illustrated comet entering the atmosphere"
				itemprop="image"
			/>

			<strong itemprop="name">CodeComet</strong>
		</a>
  </ion-toolbar>
</ion-header>
