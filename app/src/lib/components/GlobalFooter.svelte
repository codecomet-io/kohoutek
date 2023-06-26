<script
	lang="ts"
	context="module"
>
	import { openOutline, logoDiscord, logoTwitter, logoGithub } from 'ionicons/icons';
	import { objectEntries } from 'briznads-helpers';

	import ChunkyLabel from '$components/ChunkyLabel.svelte';


	type LinkGroupMap = {
		[ key : string ] : Link[];
	};

	type Link = {
		name  : string;
		link  : string;
		icon? : string;
	};
</script>


<script lang="ts">
	const linkGroupMap : LinkGroupMap = {
		'Docs'      : [
			{
				name : 'Tutorial',
				link : 'https://www.codecomet.io/docs/intro',
			},
			{
				name : 'CodeComet CLI',
				link : 'https://www.codecomet.io/docs/reference/codecomet-cli',
			},
			{
				name : 'Go SDK',
				link : 'https://pkg.codecomet.dev/github.com/codecomet-io/go-sdk@v0.0.0/codecomet',
			},
		],
		'Community' : [
			{
				name : 'Discord',
				link : 'https://discord.gg/HphFDdtTX4',
				icon : logoDiscord,
			},
			{
				name : 'Twitter',
				link : 'https://twitter.com/codecomet_io',
				icon : logoTwitter,
			},
		],
		'More'      : [
			{
				name : 'GitHub',
				link : 'https://github.com/codecomet-io',
				icon : logoGithub,
			},
		],
	};
</script>


<style lang="scss">
	ion-toolbar {
		--padding-top: 16px;
		--padding-start: 0;
		--padding-end: 0;
		--padding-bottom: 16px;
	}

	ion-list {
		background-color: transparent;

		@media (min-width: 768px) {
			display: flex;
			flex-wrap: wrap;
		}
	}

	ion-item-group {
		flex: 1;
		margin-top: 16px;

		&:first-child {
			margin-top: 0;
		}

		@media (min-width: 768px) {
			margin-top: 0;
		}
	}

	.copyright-group {
		flex-basis: 100%;
		margin-top: 16px;

		:global(.chunky-label) {
			text-align: center;
		}
	}

	ion-item-divider,
	ion-item {
		--background: transparent;
	}
</style>


<ion-footer>
	<ion-toolbar>
		<ion-list>
			{#each objectEntries(linkGroupMap) as [ key, value ] }
				<ion-item-group>
					<ion-item-divider>
						<ion-label>{ key }</ion-label>
					</ion-item-divider>

					{#each value as link }
						<ion-item
							href={ link.link }
							target="_blank"
							detail-icon={ openOutline }
						>
							{#if link.icon }
								<ion-icon
									slot="start"
									icon={ link.icon }
								></ion-icon>
							{/if }

							<ion-label>{ link.name }</ion-label>
						</ion-item>
					{/each}
				</ion-item-group>
			{/each}

			<ion-item-group class="copyright-group">
				<ion-item lines="none">
					<ion-label>
						<ChunkyLabel>Copyright © { new Date().getFullYear() } CodeComet, Inc.</ChunkyLabel>
					</ion-label>
				</ion-item>
			</ion-item-group>
		</ion-list>
	</ion-toolbar>
</ion-footer>
