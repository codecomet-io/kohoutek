<script lang="ts">
	import { close } from 'ionicons/icons';

	import CodeCometLogo from '$lib/components/CodeCometLogo.svelte';
</script>


<style lang="scss"></style>


<ion-header>
	<ion-toolbar>
		<CodeCometLogo />

		<ion-buttons slot="end">
			<ion-menu-toggle>
				<ion-button>
					<ion-icon
						slot="icon-only"
						icon={ close }
					></ion-icon>
				</ion-button>
			</ion-menu-toggle>
		</ion-buttons>
	</ion-toolbar>
</ion-header>

<ion-content class="ion-padding">Menu Content</ion-content>
