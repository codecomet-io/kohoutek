<script lang="ts">
	import { popoverController } from 'ionic-svelte'

	import IconKeyPopover from '$lib/components/IconKeyPopover.svelte'


	async function showPopover(event : any) {
		const popover = await popoverController.create({
			event,
			component: IconKeyPopover,
			cssClass: 'icon-key-popover'
		})

		await popover.present()
	}
</script>


<style lang="scss">
	ion-button {
		margin: 0;
	}
</style>


<ion-button
	fill="clear"
	size="small"
	on:click={ showPopover }
	on:keypress={ showPopover }
>View Icon Key</ion-button>
