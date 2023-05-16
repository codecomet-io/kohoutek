<script lang="ts">
	import type { LayoutData } from './$types';

	import SideMenu from '$lib/components/SideMenu.svelte';
	import StatusIcon from '$lib/components/StatusIcon.svelte';


	export let data : LayoutData;

	$: recentRuns = data.recentRuns;
</script>


<style lang="scss">
	ion-item {
		ion-label {
			padding-left: 0.25em;
		}
	}

	.view-all {
		font-weight: 700;
	}
</style>


<SideMenu>
	<svelte:fragment slot="menu">
		<ion-list>
			<ion-list-header>
				<ion-label>Recent Runs</ion-label>
			</ion-list-header>

			{#each recentRuns as run }
				<ion-item href="/document/{ run._id }">
					<StatusIcon
						size="small"
						status={ run.status }
					/>

					<ion-label>{ run.name }</ion-label>
				</ion-item>
			{/each}
		</ion-list>

		<ion-list>
			<ion-item
				class="view-all"
				href="/runs"
			>
				<ion-label>View All Runs</ion-label>
			</ion-item>
		</ion-list>
	</svelte:fragment>

	<svelte:fragment slot="page">
		<slot />
	</svelte:fragment>
</SideMenu>
