<script lang="ts">
	import type { PageData } from './$types';

	import { logoGithub, logoGitlab } from 'ionicons/icons';

	import CodeCometLogo from '$components/CodeCometLogo.svelte';


	export let data : PageData;

	function parseReturnValue() : string {
		return data.return_to
			? `?return_to=${ encodeURIComponent(data.return_to) }`
			: '';
	}
</script>


<style lang="scss">
	:global(body) {
		background:
			linear-gradient(102.92deg, #FF4752 -27.24%, rgba(233, 87, 63, 0) 64.2%),
			linear-gradient(245.06deg, rgba(255, 255, 255, 0) -14.36%, rgba(255, 255, 255, 0.67) 7.21%, #FFFFFF 32.05%, rgba(255, 255, 255, 0.85) 81.07%, rgba(255, 255, 255, 0) 111.14%),
			linear-gradient(231.11deg, #E9573F 8.23%, #FFCE54 75.59%);
		background-blend-mode: overlay, normal, normal;
	}

	main {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 75%;
		padding: 20px;
	}

	:global(.code-comet-logo) {
		font-size: 1.5em;
	}

	ion-card {
		margin-top: 40px;
		border: 1px solid #c8c7cc;
	}

	ion-card-header {
		padding: 35px 70px;
	}

	ion-card-title {
		text-align: center;
		line-height: 1.25em;
	}

	ion-card-content {
		display: flex;
		justify-content: center;
		padding-bottom: 50px;
	}

	ion-button {
		margin: 0;
	}

	// .gitlab-button {
	// 	--background: #f96424;
	// }
</style>


<main>
	<CodeCometLogo link="https://codecomet.io/" />

	<ion-card>
		<ion-card-header>
			<ion-card-title>Sign in to CodeComet</ion-card-title>
		</ion-card-header>

		<ion-card-content>
			<ion-button
				color="dark"
				href="/login/github{ parseReturnValue() }"
				rel="external"
			>
				<ion-icon
					slot="start"
					size="large"
					icon={ logoGithub }
				></ion-icon>

				Continue with GitHub
			</ion-button>

			<!-- <ion-button
				class="gitlab-button"
				href="/login/gitlab{ parseReturnValue() }"
				rel="external"
				disabled={ true }
			>
				<ion-icon
					slot="start"
					size="large"
					icon={ logoGitlab }
				></ion-icon>

				Continue with GitLab
			</ion-button> -->
		</ion-card-content>
	</ion-card>
</main>
