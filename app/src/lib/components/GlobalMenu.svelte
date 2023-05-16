<script lang="ts">
	import { close } from 'ionicons/icons';

	import CodeCometLogo from '$lib/components/CodeCometLogo.svelte';
</script>


<style lang="scss">
	ion-content {
		:global(ion-list + ion-list) {
			margin-top: 20px;
		}

		:global(ion-list-header > ion-label) {
			margin-top: 0;
		}
	}

	ion-toolbar {
		:global(> a.code-comet-logo) {
			padding: 0.5em;
		}
	}
</style>


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

<ion-content>
	<ion-list>
		<ion-item href="/sign-out">
			<ion-label>Sign Out</ion-label>
		</ion-item>
	</ion-list>

	<slot />
</ion-content>
