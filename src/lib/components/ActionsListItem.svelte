<script lang="ts">
	import type { Action } from '$lib/types/pipeline';

	import SuccessFailIcon from '$lib/components/SuccessFailIcon.svelte';
	import ChunkyLabel from '$lib/components/ChunkyLabel.svelte';


	export let action : Action;
</script>


<style lang="scss">
	[slot="header"] {
		ion-label {
			margin-left: 0.25em;
		}
	}
</style>


<ion-accordion
	value={ action.id }
	toggle-icon-slot="start"
>
	<ion-item
		slot="header"
		color="light"
	>
		<SuccessFailIcon
			success={ action.success }
			subtle={ action.status === 'canceled' }
		/>

		<ion-label>{ action.title }</ion-label>

		<ChunkyLabel
			allcaps={ false }
			slot="end"
		>
			{ action.elapsedSeconds }s
		</ChunkyLabel>
	</ion-item>

	<article
		class="ion-padding"
		slot="content"
	>
		{#if action.status }
			<div>{ action.status }</div>
		{/if}

		{#if action.spawnedBy }
			<div>invoked by { action.spawnedBy }</div>
		{/if}

		<div>started at { action.startedAt }</div>
		<div>ended at { action.endedAt }</div>
	</article>
</ion-accordion>
