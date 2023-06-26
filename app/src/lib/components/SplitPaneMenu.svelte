<script
	lang="ts"
	context="module"
>
	import type { Pipeline, Run } from '$pantry/types';

	import type { GitHubUser } from '$types/user';

	import { createEventDispatcher } from 'svelte';
	import { stopOutline, cubeOutline } from 'ionicons/icons';

	import { HEK } from '$utilities/helper';
	import { spatialMode } from '$stores/ui-toggles';

	import StatusIcon from '$components/StatusIcon.svelte';
</script>


<script lang="ts">
	export let ionMenu : HTMLIonMenuElement;
	export let gitHubUser : undefined | GitHubUser;
	export let org : undefined | string;
	export let pipelineId : undefined | string;
	export let pipeline : undefined | Pipeline;
	export let runId : undefined | string;
	export let run : undefined | Run;
	// export let runs : undefined | Run[];
	export let recentRuns : undefined | Run[];

	function closeMenu() {
		ionMenu.close();
	}

	const dispatch = createEventDispatcher();

	function toggleSpatialMode() : void {
		dispatch('toggleSpatialMode');
	}
</script>


<style lang="scss">
	ion-item-divider {
		--background: transparent;
		--padding-top: 16px;
	}

	ion-item {
		:global(> .status-icon) {
			padding-right: 0.25em;
		}
	}

	.submenu-item {
		margin-left: 16px;
	}

	.submenu-header {
		ion-label {
			margin-bottom: 2px;
			font-weight: 600;
		}
	}

	ion-chip {
		margin: 0;
		pointer-events: none;
	}
</style>


<ion-list>
	{#if org }
		<ion-item-group class="mobile-only">
			<ion-item-divider>
				<ion-label>Menu</ion-label>
			</ion-item-divider>

			<ion-item
				href="/{ org }/pipelines"
				disabled={ !pipelineId }
				on:click={ closeMenu }
				on:keydown={ closeMenu }
			>
				<ion-label>All Pipelines</ion-label>
			</ion-item>

			{#if pipelineId && pipeline?.id }
				<ion-item
					class="submenu-item submenu-header"
					lines="none"
				>
					<ion-label>{ pipeline.name }</ion-label>
				</ion-item>

				<ion-item
					class="submenu-item"
					href="/{ org }/pipeline/{ pipeline?.id }/runs"
					disabled={ !runId }
					on:click={ closeMenu }
					on:keydown={ closeMenu }
				>
					<ion-label>All Pipeline Runs</ion-label>
				</ion-item>

				{#if runId && run?.id }
					<ion-item
						class="submenu-item"
						href="/{ org }/pipeline/{ pipeline?.id }/run/{ run.id }"
						disabled={ true }
						on:click={ closeMenu }
						on:keydown={ closeMenu }
					>
						<ion-label>{ run.name }</ion-label>
					</ion-item>
				{/if}
			{/if}
		</ion-item-group>

		{#if pipeline?.id && recentRuns && recentRuns.length > 0 }
			<ion-item-group>
				<ion-item-divider>
					<ion-label>Recent Pipeline Runs</ion-label>
				</ion-item-divider>

				{#each recentRuns as recentRun }
					<ion-item
						href="/{ org }/pipeline/{ pipeline.id }/run/{ recentRun.id }"
						on:click={ closeMenu }
						on:keydown={ closeMenu }
						disabled={ recentRun.id === run?.id }
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
	{/if}

	{#if gitHubUser }
		<ion-item-group class="mobile-only">
			<ion-item-divider>
				<ion-label>Signed In As</ion-label>
			</ion-item-divider>

			<ion-item>
				<ion-chip>
					<ion-avatar>
						<img
							alt="GitHub profile image for { gitHubUser.name }"
							src={ gitHubUser.profileImage }
						/>
					</ion-avatar>

					<ion-label>{ gitHubUser.name }</ion-label>
				</ion-chip>

				<ion-button
					size="small"
					fill="clear"
					href="/logout"
					rel="external"
					color="dark"
				>Sign Out</ion-button>
			</ion-item>

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
		</ion-item-group>
	{/if}
</ion-list>
