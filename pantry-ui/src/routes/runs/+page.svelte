<script lang="ts">
	import { Firestore } from '$lib/firestore';

	import StatusIcon from '$lib/components/StatusIcon.svelte';


	const firestore = new Firestore();
</script>


<style lang="scss">
	ion-item {
		ion-label {
			padding-left: 0.25em;
		}
	}
</style>


<ion-list>
	<ion-list-header>
		<ion-label>All Runs</ion-label>
	</ion-list-header>

	{#await firestore.getRuns() then runs }
		{#each runs as run }
			<ion-item href="/document/{ run._id }">
				<StatusIcon
					size="small"
					status={ run.status }
				/>

				<ion-label>{ run.name }</ion-label>
			</ion-item>
		{/each}
	{/await}
</ion-list>
