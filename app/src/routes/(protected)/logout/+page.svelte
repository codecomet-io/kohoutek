<script lang="ts">
	import type { PageData } from './$types';

	import { onMount } from 'svelte';
	import { redirect } from '@sveltejs/kit';


	export let data : PageData;

	// setTimeout(() => {

	// }, 3000);

	onMount(() => {
		if (!data.loggedOut) {
			return;
		}

		const localStorageKey = 'gitHubUser.repos';

		window.localStorage.removeItem(localStorageKey);

		throw redirect(303, '/');
	});
</script>


<style lang="scss"></style>


<ion-content
	class="ion-padding"
	fullscreen={ true }
>
	Logout
</ion-content>
