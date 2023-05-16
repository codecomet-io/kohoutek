<script lang="ts">
	import GlobalMenu from '$lib/components/GlobalMenu.svelte';
</script>


<style lang="scss"></style>


<ion-split-pane content-id="main">
	<ion-menu content-id="main">
		<GlobalMenu>
			<slot name="menu" />
		</GlobalMenu>
	</ion-menu>

	<div class="ion-page" id="main">
		<slot name="page" />
	</div>
</ion-split-pane>
