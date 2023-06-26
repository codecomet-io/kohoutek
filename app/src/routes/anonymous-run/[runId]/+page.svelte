<script lang="ts">
	import type { PageData } from './$types';

	import RunPage from '$components/RunPage.svelte';


	export let data : PageData;
</script>


<style lang="scss"></style>


<RunPage
	run={ data.run }
	searchParams={ data.searchParams }
	anonymous={ true }
/>
