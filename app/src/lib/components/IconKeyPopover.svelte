<script lang="ts">
	import type { ActionType } from '../../../../pantry/src/lib/model';

	import { receiptOutline } from 'ionicons/icons';
	import { RunStatus, ActionStatus, FilesetType } from '../../../../pantry/src/lib/model';

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
	@media (min-width: 768px) {
		:global(.icon-key-popover) {
			--width: calc(2 / 3 * 100%);
			--max-width: 700px;
		}

		ion-list {
			display: flex;
		}

		ion-item-group {
			flex: 1;
		}
	}

	ion-item-divider {
		--padding-top: 2px;
		--padding-bottom: 2px;
		--background: transparent;

		margin-top: 10px;
		border-style: solid;
		border-color: #c8c7cc;
		border-width: 0.5px 0;

		@media (min-width: 768px) {
			margin-top: 4px;
			border-top-width: 0;
		}

		ion-item-group:first-child & {
			margin-top: 4px;
			border-top-width: 0;
		}
	}

	ion-item {
		&:last-child {
			--border-style: none;

			@media (min-width: 768px) {
				--border-style: solid;
			}
		}
	}

	ion-label {
		&.specificity-class {
			white-space: normal;
		}
	}
</style>


<ion-list>
	{#each groupedIconsList as iconGroup }
		<ion-item-group>
			<ion-item-divider>
				<ion-label>{ iconGroup.name }</ion-label>
			</ion-item-divider>

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
		</ion-item-group>
	{/each}
</ion-list>
