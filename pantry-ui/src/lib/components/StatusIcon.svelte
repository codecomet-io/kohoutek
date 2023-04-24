<script lang="ts">
	import type { PipelineStatus, ActionStatus } from '../../../../data_importer/lib/model';

	import { checkmarkCircle, alertCircle } from 'ionicons/icons';


	type ColorMap = {
		[ key in PipelineStatus | ActionStatus ]? : 'success' | 'danger' | 'medium' | 'dark' | 'warning' | 'tertiary';
	}


	export let status : PipelineStatus | ActionStatus;
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
</script>


<style lang="scss"></style>


<ion-icon
	class="status-icon"
	icon={ successStatus.includes(status) ? checkmarkCircle : alertCircle }
	color={ statusColorMap[status] ?? 'medium' }
	size={ size }
></ion-icon>
