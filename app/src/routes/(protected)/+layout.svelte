<script
	lang="ts"
	context="module"
>
	import type { BreadcrumbCustomEvent } from '@ionic/core';

	import type { LayoutData } from './$types';

	import { onMount } from 'svelte';
	import { chevronDown, stopOutline, cubeOutline } from 'ionicons/icons';
	import { sleep } from 'briznads-helpers';

	import { HEK } from '$lib/helper';
	import { scrollContainer } from '$lib/stores/scroll-container';
	import { spatialMode } from '$lib/stores/ui-toggles';

	import CodeCometLogo from '$lib/components/CodeCometLogo.svelte';
	import SplitPaneMenu from '$lib/components/SplitPaneMenu.svelte';
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

	let hiddenBreadcrumbPopover : HTMLIonPopoverElement;

	function handleCollapsedBreadcrumbClick(event : BreadcrumbCustomEvent) : void {
		if (!event?.detail?.collapsedBreadcrumbs) {
			return;
		}

		populateHiddenBreadcrumbPopover(event.detail.collapsedBreadcrumbs);

		hiddenBreadcrumbPopover.present(event);
	}

	function populateHiddenBreadcrumbPopover(hiddenBreadcrumbs : HTMLIonBreadcrumbElement[]) : void {
		const list = hiddenBreadcrumbPopover.querySelector('ion-list');

		if (!list) {
			return;
		}

		const listHtml : string = hiddenBreadcrumbs
			.map((item : HTMLIonBreadcrumbElement, index : number) => `
				<ion-item
					${ index === hiddenBreadcrumbs.length - 1 ? `lines="none"` : '' }
					href="${ item.href }"
					${ item.dataset?.disabled === 'true' ? `disabled="true"` : '' }
				>
					<ion-label>${ item.textContent }</ion-label>
				</ion-item>
			`)
			.join('');

		list.innerHTML = listHtml;
	}

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
	ion-toolbar {
		--padding-start: 11px;
		--padding-end: 11px;

		@media (min-width: 992px) {
			--padding-start: 20px;
		}
	}

	ion-buttons[slot="start"] {
		:global(.code-comet-logo) {
			display: none;

			@media (min-width: 992px) {
				display: flex;
			}
		}
	}

	.center-wrapper {
		display: flex;
		justify-content: center;

		:global(.code-comet-logo) {
			@media (min-width: 992px) {
				display: none;
			}
		}
	}

	ion-breadcrumbs {
		display: none;

		@media (min-width: 992px) {
			display: flex;
		}
	}

	ion-breadcrumb {
		&[data-disabled="true"] {
			&::part(native) {
				cursor: default;
				opacity: 0.5;
				pointer-events: none;
			}
		}
	}

	.hidden-breadcrumb-popover {
		--width: min-content;
		--max-width: 80vw;
	}

	.user-wrapper {
		display: none;
		align-items: center;

		@media (min-width: 992px) {
			display: flex;
		}
	}

	.profile-popover-trigger {
		--width: min-content;
	}

	ion-avatar {
		width: 28px;
		height: 28px;
	}

	[id="profilePopoverTrigger"] {
		margin: 0;
		font-weight: bold;

		ion-avatar {
			margin-inline-end: 0.4em;
		}

		ion-icon {
			margin-inline-start: 1.5px;
		}
	}

	.ion-page {
		ion-content {
			&::part(scroll) {
				display: flex;
				flex-direction: column;
				justify-content: space-between;
			}
		}
	}
</style>


<ion-header>
	<ion-toolbar>
		<ion-buttons slot="start">
			<ion-menu-button class="mobile-only"></ion-menu-button>

			<CodeCometLogo />
		</ion-buttons>

		<div class="center-wrapper">
			<CodeCometLogo />

			<ion-breadcrumbs
				max-items={ 3 }
				on:ionCollapsedClick={ handleCollapsedBreadcrumbClick }
			>
				<ion-breadcrumb href="/{ data.org }/pipelines">All Pipelines</ion-breadcrumb>

				{#if data.pipeline }
					<ion-breadcrumb
						href="/{ data.org }/pipeline/{ data.pipeline.id }"
						data-disabled="true"
					>{ data.pipeline.name }</ion-breadcrumb>

					<ion-breadcrumb href="/{ data.org }/pipeline/{ data.pipeline.id }/runs">All Pipeline Runs</ion-breadcrumb>

					{#if data.run }
						<ion-breadcrumb href="/{ data.org }/pipeline/{ data.pipeline.id }/run/{ data.run.id }">{ data.run.name }</ion-breadcrumb>
					{/if}
				{/if}
			</ion-breadcrumbs>

			<ion-popover
				class="hidden-breadcrumb-popover"
				bind:this={ hiddenBreadcrumbPopover }
				dismiss-on-select={ true }
			>
				<ion-content>
					<ion-list></ion-list>
				</ion-content>
			</ion-popover>
		</div>

		<ion-buttons slot="end">
			<div class="user-wrapper">
				<ion-button
					id="profilePopoverTrigger"
					size="small"
					color="dark"
				>
					<ion-avatar slot="start">
						<img
							alt="GitHub profile image for { data.gitHubUser?.name }"
							src={ data.gitHubUser?.profileImage }
						/>
					</ion-avatar>

					{ data.gitHubUser?.name }

					<ion-icon
						slot="end"
						icon={ chevronDown }
						color="medium"
						size="small"
					></ion-icon>
				</ion-button>

				<ion-popover
					class="profile-popover-trigger"
					trigger="profilePopoverTrigger"
					dismiss-on-select={ true }
				>
					<ion-content>
						<ion-list>
							<!-- <ion-item
								button={ true }
								detail={ false }
								on:click={ toggleDarkMode }
								on:keydown={ (e) => HEK(e, toggleDarkMode) }
							>
								<ion-label>{ $darkMode ? 'Disable' : 'Enable' } Dark Mode</ion-label>

								<ion-icon
									slot="end"
									icon={ $darkMode ? sunnyOutline : moonOutline }
								></ion-icon>
							</ion-item> -->

							<ion-item
								button={ true }
								detail={ false }
								on:click={ toggleSpatialMode }
								on:keydown={ (e) => HEK(e, toggleSpatialMode) }
							>
								<ion-label>{ $spatialMode ? 'Disable' : 'Enable' } Spatial Mode</ion-label>

								<ion-icon
									slot="end"
									icon={ $spatialMode ? stopOutline : cubeOutline }
								></ion-icon>
							</ion-item>

							<ion-item
								href="/logout"
								rel="external"
								lines="none"
							>
								<ion-label>Sign Out</ion-label>
							</ion-item>
						</ion-list>
					</ion-content>
				</ion-popover>
			</div>
		</ion-buttons>
	</ion-toolbar>
</ion-header>

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

				<ion-footer>
					<ion-toolbar>
						<ion-title>Footer</ion-title>
					</ion-toolbar>
				</ion-footer>
			</ion-content>
		</div>
	</ion-split-pane>
</ion-content>
