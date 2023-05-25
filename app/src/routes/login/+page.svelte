<script lang="ts">
	import type { PageData } from './$types';

	import { logoGithub, logoGitlab } from 'ionicons/icons';


	export let data : PageData;

	function parseReturnValue() : string {
		return data.return_to
			? `?return_to=${ encodeURIComponent(data.return_to) }`
			: '';
	}
</script>


<style lang="scss">
	main {
		padding: 20px;
	}

	.gitlab-button {
		--background: #f96424;
	}
</style>


<main>
	<h1>login</h1>

	<div>
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
	</div>

	<div>
		<ion-button
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
		</ion-button>
	</div>
</main>
