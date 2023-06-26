<script
	lang="ts"
	context="module"
>
	import type { LayoutData } from './$types';

	import { onMount } from 'svelte';
	import { sleep } from 'briznads-helpers';

	import { scrollContainer } from '$stores/scroll-container';
	import { spatialMode } from '$stores/ui-toggles';

	import SplitPaneMenu from '$components/SplitPaneMenu.svelte';
	import GlobalHeader from '$components/GlobalHeader.svelte';
	import GlobalFooter from '$components/GlobalFooter.svelte';
</script>


<script lang="ts">
	export let data : LayoutData;

	$: console.debug({ data });

	onMount(() => {
		const localStorageKey = 'gitHubUser.repos';

		window.localStorage.setItem(localStorageKey, JSON.stringify(data.gitHubUser.repos));
	});

	let ionContent : HTMLIonContentElement;

	onMount(() => {
		scrollContainer.set(ionContent);
	});

	let ionMenu : HTMLIonMenuElement;

	// function updateDarkMode(enabled : boolean) : void {
	// 	document.body.classList.toggle('dark', enabled);
	// }

	// $: updateDarkMode($darkMode);

	// function checkDarkMode() : void {
	// 	const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

	// 	if (prefersDark.matches) {
	// 		darkMode.set(true);
	// 	}

	// 	prefersDark.onchange = (event : MediaQueryListEvent) => {
	// 		darkMode.set(event.matches);
	// 	};
	// }

	// onMount(checkDarkMode);

	// async function toggleDarkMode() : Promise<void> {
	// 	await sleep(250);

	// 	darkMode.update((enabled : boolean) => !enabled);
	// }


	const localStorageKey = 'spatialMode';

	function checkSpatialMode() : void {
		let storedSpatialMode = window.localStorage.getItem(localStorageKey);

		if (storedSpatialMode == null) {
			return;
		}

		storedSpatialMode = JSON.parse(storedSpatialMode);

		if (typeof storedSpatialMode !== 'boolean') {
			return;
		}

		spatialMode.set(storedSpatialMode);
	}

	onMount(checkSpatialMode);

	async function toggleSpatialMode() : Promise<void> {
		await sleep(250);

		spatialMode.update((enabled : boolean) => !enabled);

		window.localStorage.setItem(localStorageKey, JSON.stringify($spatialMode));
	}
</script>


<style lang="scss">
	.ion-page {
		ion-content {
			&::part(scroll) {
				display: flex;
				flex-direction: column;
				justify-content: space-between;
			}
		}
	}

	main {
		padding-bottom: 80px;
	}
</style>


<GlobalHeader
	gitHubUser={ data.gitHubUser }
	org={ data.org }
	pipeline={ data.pipeline }
	run={ data.run }
	on:toggleSpatialMode={ toggleSpatialMode }
/>

<ion-content>
	<ion-split-pane
		content-id="main"
		disabled={ !(data.recentRuns && data.recentRuns.length > 0) }
	>
		<ion-menu
			content-id="main"
			bind:this={ ionMenu }
		>
			<ion-content>
				<SplitPaneMenu
					{ ionMenu }
					gitHubUser={ data.gitHubUser }
					org={ data.org }
					pipelineId={ data.pipelineId }
					pipeline={ data.pipeline }
					runId={ data.runId }
					run={ data.run }
					recentRuns={ data.recentRuns }
					on:toggleSpatialMode={ toggleSpatialMode }
				/>
			</ion-content>
		</ion-menu>

		<div
			id="main"
			class="ion-page"
		>
			<ion-content
				fullscreen={ true }
				bind:this={ ionContent }
			>
				<main class="ion-padding">
					<slot />
				</main>

				<GlobalFooter />
			</ion-content>
		</div>
	</ion-split-pane>
</ion-content>
