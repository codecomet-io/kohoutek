<script lang="ts">
	import type { PipelinePostRunData } from '$lib/types/pipeline';

	import PipelineHeader from '$lib/components/PipelineHeader.svelte';
	import ActionsList from '$lib/components/ActionsList.svelte';

	import results from '$lib/data/example.json';


	const typedResults = results as PipelinePostRunData;
</script>


<style lang="scss"></style>


<PipelineHeader pipeline={ typedResults } />

<ion-content fullscreen={ true }>
	<ActionsList actions={ typedResults.actions } />
</ion-content>
