<script lang="ts">
	import type { LayoutData } from './$types';

	import { onMount } from 'svelte';
	import { chevronDown } from 'ionicons/icons';

	import CodeCometLogo from '$lib/components/CodeCometLogo.svelte';
	import StatusIcon from '$lib/components/StatusIcon.svelte';


	export let data : LayoutData;

	onMount(() => {
		const localStorageKey = 'gitHubUser.repos';

		window.localStorage.setItem(localStorageKey, JSON.stringify(data.gitHubUser.repos));
	});

	$: console.debug({ data });

	let ionMenu : HTMLIonMenuElement;

	function closeMenu() {
		ionMenu.close();
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

	.user-wrapper {
		display: none;
		align-items: center;

		@media (min-width: 992px) {
			display: flex;
		}
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

	.mobile-only {
		@media (min-width: 992px) {
			display: none;
		}
	}

	ion-item-divider {
		--background: transparent;
		--padding-top: 16px;
	}

	ion-item {
		:global(> .status-icon) {
			padding-right: 0.25em;
		}
	}

	ion-chip {
		margin: 0;
		pointer-events: none;
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

			<ion-breadcrumbs>
				<ion-breadcrumb href="/{ data.org }/pipelines">All Pipelines</ion-breadcrumb>

				{#if data.pipeline }
					<ion-breadcrumb disabled={ true }>{ data.pipeline.name }</ion-breadcrumb>

					<ion-breadcrumb href="/{ data.org }/pipeline/{ data.pipeline.id }/runs">All Pipeline Runs</ion-breadcrumb>

					{#if data.run }
						<ion-breadcrumb href="/{ data.org }/pipeline/{ data.pipeline.id }/run/{ data.run.id }">This Run</ion-breadcrumb>
					{/if}
				{/if}
			</ion-breadcrumbs>
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
					trigger="profilePopoverTrigger"
					dismiss-on-select={ true }
				>
					<ion-content>
						<ion-list>
							<ion-item
								href="/logout"
								rel="external"
								lines="none"
							>Sign Out</ion-item>
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
				<ion-list>
					<ion-item-group class="mobile-only">
						<ion-item
							href="/{ data.org }/pipelines"
							on:click={ closeMenu }
							on:keydown={ closeMenu }
						>
							<ion-label>All Pipelines</ion-label>
						</ion-item>

						{#if data.pipeline?.id }
							<ion-item
								href="/{ data.org }/pipeline/{ data.pipeline?.id }/runs"
								on:click={ closeMenu }
								on:keydown={ closeMenu }
							>
								<ion-label>All Pipeline Runs</ion-label>
							</ion-item>
						{/if}
					</ion-item-group>

					{#if data.pipeline?.id && data.recentRuns && data.recentRuns.length > 0 }
						<ion-item-group>
							<ion-item-divider>
								<ion-label>Recent Runs</ion-label>
							</ion-item-divider>

							{#each data.recentRuns as recentRun }
								<ion-item
									href="/{ data.org }/pipeline/{ data.pipeline.id }/run/{ recentRun.id }"
									on:click={ closeMenu }
									on:keydown={ closeMenu }
								>
									<StatusIcon
										size="small"
										status={ recentRun.status }
									/>

									<ion-label>{ recentRun.name }</ion-label>
								</ion-item>
							{/each}
						</ion-item-group>
					{/if}

					<ion-item-group class="mobile-only">
						<ion-item-divider>
							<ion-label>Signed In As</ion-label>
						</ion-item-divider>

						<ion-item>
							<ion-chip>
								<ion-avatar>
									<img
										alt="GitHub profile image for { data.gitHubUser?.name }"
										src={ data.gitHubUser?.profileImage }
									/>
								</ion-avatar>

								<ion-label>{ data.gitHubUser?.name }</ion-label>
							</ion-chip>

							<ion-button
								size="small"
								fill="clear"
								href="/logout"
								rel="external"
								color="dark"
							>Sign Out</ion-button>
						</ion-item>
					</ion-item-group>
				</ion-list>
			</ion-content>
		</ion-menu>

		<div class="ion-page" id="main">
			<slot />
		</div>
	</ion-split-pane>
</ion-content>
