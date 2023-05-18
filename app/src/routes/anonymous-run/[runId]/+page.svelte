<script lang="ts">
	import type { PageData } from './$types';
	import type { Run } from '../../../../../pantry/src/lib/model';

	import RunPage from '$lib/components/RunPage.svelte';


	export let data : PageData;

	let run : Run;
	let searchParams : URLSearchParams;

	$: run = data.run;
	$: searchParams = data.searchParams;
</script>


<style lang="scss"></style>


<RunPage { run } { searchParams } anonymous={ true } />
