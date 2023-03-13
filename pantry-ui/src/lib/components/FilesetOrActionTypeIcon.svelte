<script lang="ts">
	import type { ActionType, FilesetType } from '../../../../data_importer/lib/model';

	import {
		colorPaletteOutline,
		moveOutline,
		createOutline,
		folderOutline,
		arrowRedoOutline,
		gitMergeOutline,
		magnetOutline,
		globeOutline,
		folderOpenOutline,
		bandageOutline,
		logoDocker,
		logoGithub,
		logoGitlab,
	} from 'ionicons/icons';


	type CustomIcon =
		| 'gitlab'


	export let type : ActionType | FilesetType
	export let icon : undefined | CustomIcon = undefined
	export let size : undefined | 'small' | 'default' | 'large' = undefined

	const iconMap : { [ key in typeof type | CustomIcon ]? : any } = {
		custom: colorPaletteOutline,
		addFile: createOutline,
		makeDirectory: folderOutline,
		move: moveOutline,
		createSymbolicLink: arrowRedoOutline,
		merge: gitMergeOutline,
		patch: bandageOutline,
		// fileset types
		http: globeOutline,
		local: folderOpenOutline,
		docker: logoDocker,
		git: logoGithub,
		gitlab: logoGitlab,
	}

	$: iconMapKey = icon && iconMap[icon]
		? icon
		: type
</script>


<style lang="scss"></style>


<ion-icon
	class="fileset-or-action-type-icon"
	icon={ iconMap[ iconMapKey ] ?? magnetOutline }
	size={ size }
></ion-icon>
