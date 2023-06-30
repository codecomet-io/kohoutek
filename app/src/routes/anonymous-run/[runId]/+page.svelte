<script
	lang="ts"
	context="module"
>
	import type { PageData } from './$types';

	import { onMount } from 'svelte';

	import { scrollContainer } from '$stores/scroll-container';

	import RunPage from '$components/RunPage.svelte';
	import GlobalFooter from '$components/GlobalFooter.svelte';
</script>


<script lang="ts">
	export let data : PageData;

	let ionContent : HTMLIonContentElement;

	onMount(() => {
		scrollContainer.set(ionContent);
	});
</script>


<style lang="scss">
	main {
		--padding: 16px;
		--padding-bottom: 80px;

		padding: var(--padding) var(--padding) var(--padding-bottom) var(--padding);
	}
</style>


<ion-content
	fullscreen={ true }
	bind:this={ ionContent }
>
	<main>
		<RunPage
			run={ data.run }
			searchParams={ data.searchParams }
			anonymous={ true }
		/>
	</main>

	<GlobalFooter />
</ion-content>
