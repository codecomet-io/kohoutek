<script
	lang="ts"
	context="module"
>
	import type { Pipeline, Run } from '$pantry/types';

	import type { GitHubUser } from '$types/user';

	import { chevronDown, stopOutline, cubeOutline } from 'ionicons/icons';
	import { createEventDispatcher } from 'svelte';

	import { HEK } from '$utilities/helper';
	import { spatialMode } from '$stores/ui-toggles';

	import CodeCometLogo from '$components/CodeCometLogo.svelte';
	import BreadcrumbNav from '$components/BreadcrumbNav.svelte';
</script>


<script lang="ts">
	export let gitHubUser : undefined | GitHubUser;
	export let org : undefined | string;
	export let pipeline : undefined | Pipeline;
	export let run : undefined | Run;

	const dispatch = createEventDispatcher();

	function toggleSpatialMode() : void {
		dispatch('toggleSpatialMode');
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
</style>


<ion-header>
	<ion-toolbar>
		<ion-buttons slot="start">
			<ion-menu-button class="mobile-only"></ion-menu-button>

			<CodeCometLogo link="/{ org }/pipelines" />
		</ion-buttons>

		<div class="center-wrapper">
			<CodeCometLogo link="/{ org }/pipelines" />

			<BreadcrumbNav
				{ org }
				{ pipeline }
				{ run }
			/>
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
							alt="GitHub profile image for { gitHubUser?.name }"
							src={ gitHubUser?.profileImage }
						/>
					</ion-avatar>

					{ gitHubUser?.name }

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
