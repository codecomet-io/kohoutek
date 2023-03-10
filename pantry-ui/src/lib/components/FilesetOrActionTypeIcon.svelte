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
	} from 'ionicons/icons';


	export let type : ActionType | FilesetType;

	const iconMap : { [ key in ActionType | FilesetType ]? : any } = {
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
	};
</script>


<style lang="scss"></style>


<ion-icon
	class="fileset-or-action-type-icon"
	icon={ iconMap[type] ?? magnetOutline }
></ion-icon>
