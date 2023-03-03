<script lang="ts">
	import { checkmarkCircle } from 'ionicons/icons';
	import { alertCircle } from "ionicons/icons";

	export let success : boolean;
	export let subtle : undefined | boolean = undefined;
	export let size : undefined | 'small' | 'medium' | 'large' = undefined;

	function parseColor(success : boolean, subtle : undefined | boolean) : 'success' | 'danger' | 'medium' {
		return subtle
			? 'medium'
			: success
				? 'success'
				: 'danger';
	}

	$: color = parseColor(success, subtle);
</script>


<style lang="scss"></style>


<ion-icon
	icon={ success ? checkmarkCircle : alertCircle }
	color={ color }
	size={ size }
></ion-icon>
