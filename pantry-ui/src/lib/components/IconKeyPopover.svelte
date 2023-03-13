<script lang="ts">
	import type { ActionType } from '../../../../data_importer/lib/model';

	import { PipelineStatus, ActionStatus, FilesetType } from '../../../../data_importer/lib/model';

	import StatusIcon from '$lib/components/StatusIcon.svelte';
	import FilesetOrActionTypeIcon from '$lib/components/FilesetOrActionTypeIcon.svelte';


	type GroupedIconsList = IconGroup[]

	type IconGroup = {
		name : string
		icons : StatusIcon[] | TypeIcon[]
	}

	type StatusIcon = {
		name? : string
		status : PipelineStatus | ActionStatus
	}

	type TypeIcon = {
		name? : string
		type : ActionType | FilesetType
		icon? : 'gitlab'
	}

	const groupedIconsList : GroupedIconsList = [
		{
			name : 'status',
			icons : [
				{
					status : PipelineStatus.Completed,
				},
				{
					status : ActionStatus.Cached,
				},
				{
					status : PipelineStatus.Errored,
				},
				{
					status : PipelineStatus.Degraded,
				},
				{
					status : PipelineStatus.Cancelled,
				},
				{
					status : ActionStatus.Ignored,
				},
			],
		},
		{
			name : 'fileset type',
			icons : [
				{
					type : FilesetType.HTTP,
				},
				{
					type : FilesetType.Local,
				},
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
			],
		},
		{
			name : 'action type',
			icons : [
				{
					type : 'custom',
				},
				{
					type : 'addFile',
					name : 'add file',
				},
				{
					type : 'makeDirectory',
					name : 'make directory',
				},
				{
					type : 'move',
				},
				{
					type : 'createSymbolicLink',
					name : 'create symbolic link',
				},
				{
					type : 'merge',
				},
				{
					type : 'patch',
				},
			],
		},
	]
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
						{/if}
					</div>

					<ion-label class="specificity-class">{ item.name ?? item.status ?? item.icon ?? item.type }</ion-label>
				</ion-item>
			{/each}
		</ion-list>
	{/each}
</div>
