<script lang="ts">
	import type { Status } from '$lib/types/pipeline';

	import { checkmarkCircle } from 'ionicons/icons';
	import { alertCircle } from "ionicons/icons";


	type ColorMap = {
		[ key in Status ] : 'success' | 'danger' | 'medium';
	};


	export let status : Status;
	export let size : undefined | 'small' | 'medium' | 'large' = undefined;

	const statusColorMap : ColorMap = {
		completed: 'success',
		errored: 'danger',
		canceled: 'medium',
		ignored: 'medium',
		cached: 'medium',
	};
</script>


<style lang="scss"></style>


<ion-icon
	icon={ status === 'completed' ? checkmarkCircle : alertCircle }
	color={ statusColorMap[status] }
	size={ size }
></ion-icon>
