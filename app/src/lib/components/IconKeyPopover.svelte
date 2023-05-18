<script lang="ts">
	import type { ActionType, RunStatus, ActionStatus, FilesetType } from '../../../../../pantry/src/lib/model';

	import { receiptOutline } from 'ionicons/icons';

	import StatusIcon from '$lib/components/StatusIcon.svelte';
	import FilesetOrActionTypeIcon from '$lib/components/FilesetOrActionTypeIcon.svelte';


	type GroupedIconsList = IconGroup[]

	type IconGroup = {
		name : string
		icons : StatusIconDefinition[] | TypeIconDefinition[] | MiscIconDefinition[]
	}

	type StatusIconDefinition = {
		name? : string
		status : RunStatus | ActionStatus
	}

	type TypeIconDefinition = {
		name? : string
		type : ActionType | FilesetType | 'unknown'
		icon? : 'gitlab'
	}

	type MiscIconDefinition = {
		name? : string
		icon : string
	}


	const miscIconMap : { [ key : string ] : string } = {
		receiptOutline,
	};

	const groupedIconsList : GroupedIconsList = [
		{
			name  : 'status',
			icons : [
				{
					status : ActionStatus.Cached,
				},
				{
					status : RunStatus.Cancelled,
				},
				{
					status : RunStatus.Completed,
				},
				{
					status : RunStatus.Degraded,
				},
				{
					status : RunStatus.Errored,
				},
				{
					status : ActionStatus.Ignored,
				},
			],
		},
		{
			name  : 'fileset type',
			icons : [
				{
					type : FilesetType.Image,
				},
				{
					type : FilesetType.Git,
				},
				{
					type : FilesetType.Git,
					icon : 'gitlab',
				},
				{
					type : FilesetType.HTTP,
				},
				{
					type : FilesetType.Local,
				},
			],
		},
		{
			name  : 'action type',
			icons : [
				{
					type : 'addFile',
					name : 'add file',
				},
				{
					type : 'copy',
				},
				{
					type : 'createSymbolicLink',
					name : 'create symbolic link',
				},
				{
					type : 'custom',
				},
				{
					type : 'makeDirectory',
					name : 'make directory',
				},
				{
					type : 'merge',
				},
				{
					type : 'move',
				},
				{
					type : 'patch',
				},
				{
					type : 'unknown',
				},
			],
		},
		{
			name  : 'misc',
			icons : [
				{
					icon : 'receiptOutline',
					name : 'view logs',
				},
			],
		},
	];
</script>


<style lang="scss">
	ion-list-header {
		margin-bottom: 7px;
	}

	@media (min-width: 768px) {
		:global(.icon-key-popover) {
			--width: calc(2 / 3 * 100%);
			--max-width: 700px;
		}

		.groups-container {
			display: flex;
		}

		ion-list {
			flex: 1;
		}
	}

	ion-label {
		&.specificity-class {
			white-space: normal;
		}
	}
</style>


<div class="groups-container">
	{#each groupedIconsList as iconGroup }
		<ion-list>
			<ion-list-header>{ iconGroup.name }</ion-list-header>

			{#each iconGroup.icons as item }
				<ion-item>
					<div slot="start">
						{#if item.status }
							<StatusIcon
								status={ item.status }
								size="large"
							/>
						{:else if item.type }
							<FilesetOrActionTypeIcon
								type={ item.type }
								icon={ item.icon }
								size="large"
							/>
						{:else if item.icon }
							<ion-icon
								icon={ miscIconMap[item.icon] }
								size="large"
							></ion-icon>
						{/if}
					</div>

					<ion-label class="specificity-class">{ item.name ?? item.status ?? item.icon ?? item.type }</ion-label>
				</ion-item>
			{/each}
		</ion-list>
	{/each}
</div>
