<script lang="ts">
	import type { PageData } from './$types';
	import type { Run } from '../../../../../data_importer/src/lib/model';

	import StatusIcon from '$lib/components/StatusIcon.svelte';


	export let data : PageData;

	let runs : Run[];

	$: runs = data.runs;
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

	{#each runs as run }
		<ion-item href="/document/{ run.id }">
			<StatusIcon
				size="small"
				status={ run.status }
			/>

			<ion-label>{ run.name }</ion-label>
		</ion-item>
	{/each}
</ion-list>
