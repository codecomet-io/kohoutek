<script lang="ts">
	import type { RunStatus, ActionStatus } from '$pantry/types';

	import { alertCircle, checkmarkCircle, warning } from 'ionicons/icons';


	type ColorMap = {
		[ key in RunStatus | ActionStatus ]? : 'success' | 'danger' | 'medium' | 'dark' | 'warning' | 'tertiary';
	}


	export let status : RunStatus | ActionStatus;
	export let size : undefined | 'small' | 'default' | 'large' = undefined;

	const successStatus = [
		'completed',
		'cached',
	];

	const statusColorMap : ColorMap = {
		completed : 'success',
		errored   : 'danger',
		degraded  : 'warning',
		cancelled : 'dark',
		ignored   : 'medium',
		cached    : 'tertiary',
	};

	function getIcon(status : RunStatus | ActionStatus) : string {
		if (successStatus.includes(status)) {
			return checkmarkCircle;
		} else if (status === 'cancelled') {
			return alertCircle;
		} else {
			return warning;
		}
	}
</script>


<style lang="scss"></style>


<ion-icon
	class="status-icon"
	icon={ getIcon(status) }
	color={ statusColorMap[status] ?? 'medium' }
	size={ size }
></ion-icon>
