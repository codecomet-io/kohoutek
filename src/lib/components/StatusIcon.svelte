<script lang="ts">
	import type { Status } from '$lib/types/pipeline';

	import { checkmarkCircle } from 'ionicons/icons';
	import { alertCircle } from "ionicons/icons";

	export let status : Status;
	export let size : undefined | 'small' | 'medium' | 'large' = undefined;

	const statusColorMap = {
		success: 'success',
		error: 'danger',
		canceled: 'medium',
	};

	$: color = statusColorMap[status];
</script>


<style lang="scss"></style>


<ion-icon
	icon={ status === 'success' ? checkmarkCircle : alertCircle }
	color={ color }
	size={ size }
></ion-icon>
