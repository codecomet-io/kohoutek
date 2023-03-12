<script lang="ts">
	// status icons
	import {
		// status
		checkmarkCircle,
		alertCircle,
		// fileset type
		globeOutline,
		folderOpenOutline,
		logoDocker,
		logoGithub,
		logoGitlab,
		// action type
		colorPaletteOutline,
		createOutline,
		folderOutline,
		moveOutline,
		arrowRedoOutline,
		gitMergeOutline,
		bandageOutline,
		magnetOutline,
	} from 'ionicons/icons';


	type GroupedIconsList = IconGroup[]

	type IconGroup = {
		name : string
		icons : Icon[]
	}

	type Icon = {
		name : string
		icon : any
		color? : IconColor
	}

	type IconColor =
		| 'success'
		| 'danger'
		| 'warning'
		| 'medium'
		| 'light'
		| 'tertiary'

	const groupedIconsList : GroupedIconsList = [
		{
			name : 'status',
			icons : [
				{
					name : 'completed',
					icon : checkmarkCircle,
					color : 'success',
				},
				{
					name : 'cached',
					icon : checkmarkCircle,
					color : 'tertiary',
				},
				{
					name : 'errored',
					icon : alertCircle,
					color : 'danger',
				},
				{
					name : 'degraded',
					icon : alertCircle,
					color : 'warning',
				},
				{
					name : 'canceled',
					icon : alertCircle,
					color : 'medium',
				},
				{
					name : 'ignored',
					icon : alertCircle,
					color : 'light',
				},
			],
		},
		{
			name : 'fileset type',
			icons : [
				{
					name : 'http',
					icon : globeOutline,
				},
				{
					name : 'local',
					icon : folderOpenOutline,
				},
				{
					name : 'docker',
					icon : logoDocker,
				},
				{
					name : 'git',
					icon : logoGithub,
				},
				{
					name : 'gitlab',
					icon : logoGitlab,
				},
				{
					name : 'unknown',
					icon : magnetOutline,
				},
			],
		},
		{
			name : 'action type',
			icons : [
				{
					name : 'custom',
					icon : colorPaletteOutline,
				},
				{
					name : 'add file',
					icon : createOutline,
				},
				{
					name : 'make directory',
					icon : folderOutline,
				},
				{
					name : 'move',
					icon : moveOutline,
				},
				{
					name : 'create symbolic link',
					icon : arrowRedoOutline,
				},
				{
					name : 'merge',
					icon : gitMergeOutline,
				},
				{
					name : 'patch',
					icon : bandageOutline,
				},
				{
					name : 'unknown',
					icon : magnetOutline,
				},
			],
		},
	]
</script>


<style lang="scss">
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

			{#each iconGroup.icons as icon }
				<ion-item>
					<ion-icon
						slot="start"
						icon={ icon.icon }
						color={ icon.color }
					></ion-icon>

					<ion-label class="specificity-class">{ icon.name }</ion-label>
				</ion-item>
			{/each}
		</ion-list>
	{/each}
</div>
