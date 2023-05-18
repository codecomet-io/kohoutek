<script lang="ts">
	import type { LayoutData } from './$types';

	import type { Run } from '../../../../pantry/src/lib/model';

	import CodeCometLogo from '$lib/components/CodeCometLogo.svelte';
	import StatusIcon from '$lib/components/StatusIcon.svelte';


	export let data : LayoutData;

	let run : undefined | Run;
	let runs : undefined | Run[];
	let recentRuns : undefined | Run[];

	let pipelineId : undefined | string;

	$: {
		run = data.run;
		runs = data.runs;
		recentRuns = data.recentRuns;

		pipelineId = run?.pipelineId ?? runs?.[0]?.pipelineId;
	}

	let ionMenu : HTMLIonMenuElement;

	function closeMenu(event : any) {
		console.debug(event);

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
				<ion-breadcrumb href="#">All Pipelines</ion-breadcrumb>

				{#if pipelineId }
					<ion-breadcrumb href="/pipeline/{ pipelineId }/runs">All Pipeline Runs</ion-breadcrumb>
				{/if}

				{#if run }
					<ion-breadcrumb href="/run/{ run.id }">This Run</ion-breadcrumb>
				{/if}
			</ion-breadcrumbs>
		</div>

		<ion-buttons slot="end">
			<div class="user-wrapper">
				<ion-avatar>
					<img alt="Silhouette of a person's head" src="https://ionicframework.com/docs/img/demos/avatar.svg" />
				</ion-avatar>

				<ion-button size="small">
					Sign Out
				</ion-button>
			</div>
		</ion-buttons>
	</ion-toolbar>
</ion-header>

<ion-content>
	<ion-split-pane
		content-id="main"
		disabled={ !(recentRuns && recentRuns.length > 0) }
	>
		<ion-menu
			content-id="main"
			bind:this={ ionMenu }
			on:click={ closeMenu }
		>
			<ion-content>
				<ion-list>
					<ion-item-group class="mobile-only">
						<ion-item href="#">
							<ion-label>All Pipelines</ion-label>
						</ion-item>

						{#if pipelineId }
							<ion-item href="/pipeline/{ pipelineId }/runs">
								<ion-label>All Pipeline Runs</ion-label>
							</ion-item>
						{/if}
					</ion-item-group>

					{#if recentRuns && recentRuns.length > 0 }
						<ion-item-group>
							<ion-item-divider>
								<ion-label>Recent Runs</ion-label>
							</ion-item-divider>

							{#each recentRuns as recentRun }
								<ion-item href="/run/{ recentRun.id }">
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
									<img alt="Silhouette of a person's head" src="https://ionicframework.com/docs/img/demos/avatar.svg" />
								</ion-avatar>

								<ion-label>Person</ion-label>
							</ion-chip>

							<ion-button
								size="small"
								fill="clear"
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
