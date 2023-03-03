<script lang="ts">
	import SuccessFailIcon from '$lib/components/SuccessFailIcon.svelte';

	import results from '$lib/data/example.json';
</script>


<style lang="scss">
	.pipeline-title-success {
		display: flex;
		align-items: center;

		h1 {
			margin-top: 0;
			margin-bottom: 0;
			margin-left: 0.25em;
		}
	}

	ion-card-subtitle {
		margin-top: 7px;
		margin-bottom: 0;
	}
</style>


<ion-header translucent={ true }>
  <ion-toolbar class="ion-padding">
		<div class="pipeline-title-success">
			<SuccessFailIcon
				success={ results.success }
				subtle={ results.status === 'canceled' }
				size="large"
			/>

			<h1>{ results.title }</h1>
		</div>

		<ion-card-subtitle>{ results.success ? 'succeed' : 'fail' }ed 5 days ago in { results.elapsedSeconds } seconds</ion-card-subtitle>
  </ion-toolbar>
</ion-header>

<ion-content fullscreen={ true }>
  <ion-accordion-group class="ion-padding">
		{#each results.actions as action, index }
			<ion-accordion value="action{ index }" toggle-icon-slot="start">
				<ion-item slot="header" color="light">
					<SuccessFailIcon
						success={ action.success }
						subtle={ action.status === 'canceled' }
					/>

					<ion-label>{ action.title }</ion-label>
				</ion-item>

				<div class="ion-padding" slot="content">
					First Content
				</div>
			</ion-accordion>
		{/each}
	</ion-accordion-group>
</ion-content>
