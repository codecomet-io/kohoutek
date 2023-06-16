<script lang="ts">
	import type { PageData } from './$types';

	import { onMount } from 'svelte';


	export let data : PageData;

	onMount(() => {
		if (!data.loggedOut) {
			return;
		}

		const localStorageKey = 'gitHubUser.repos';

		window.localStorage.removeItem(localStorageKey);

		window.location.replace('/');
	});
</script>


<style lang="scss"></style>


Logging Out…
