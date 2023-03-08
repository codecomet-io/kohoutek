<script lang="ts">
	import type { PageData } from "./$types";
	import type { PipelinePostRunData } from "$lib/types/pipeline";

	import PipelineHeader from "$lib/components/PipelineHeader.svelte";
	import ActionsList from "$lib/components/ActionsList.svelte";


	export let data: PageData;

	const typedResults = data.pipeline as PipelinePostRunData;
</script>

<PipelineHeader pipeline={typedResults} />

<ion-content fullscreen={true}>
	<ActionsList actions={typedResults.actions} />
</ion-content>

<style lang="scss"></style>
