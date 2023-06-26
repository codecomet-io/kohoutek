<script lang="ts">
	import type { FilesetAction, Action } from '$pantry/types';

	import { receiptOutline } from 'ionicons/icons';

	import { gotoSearchString } from '$utilities/helper';


	export let item : FilesetAction | Action;
</script>


<style lang="scss">
	.view-logs-button-wrapper {
		display: flex;
		justify-content: right;
		flex-grow: 1;
		flex-basis: 0%;
	}
</style>


<div class="view-logs-button-wrapper">
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<ion-button
		fill={ item.status === 'errored' ? 'solid' :'outline' }
		color={ item.status === 'errored' ? 'danger' :'default' }
		size="small"
		on:click={ () => gotoSearchString('active_modal', item.id) }
	>
		View Logs

		<ion-icon
			slot="start"
			icon={ receiptOutline }
		></ion-icon>
	</ion-button>
</div>
