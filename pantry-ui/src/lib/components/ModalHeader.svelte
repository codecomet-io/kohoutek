<script lang="ts">
	export let title : string
	export let dismissModal : () => void | Promise<any>
</script>


<style lang="scss"></style>


<ion-header>
	<ion-toolbar>
		<ion-title>{ title }</ion-title>

		<ion-buttons slot="end">
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<ion-button
				fill="clear"
				on:click={ dismissModal }
			>
				Close
			</ion-button>
		</ion-buttons>
	</ion-toolbar>
</ion-header>