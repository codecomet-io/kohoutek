<script lang="ts">
	import type { Action } from '$lib/types/pipeline';

	import ActionsListItem from '$lib/components/ActionsListItem.svelte';


	export let actions : Action[];
</script>


<style lang="scss"></style>


<ion-accordion-group>
	{#each actions as action }
		<ActionsListItem action={ action } />
	{/each}
</ion-accordion-group>
