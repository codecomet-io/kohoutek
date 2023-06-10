<script lang="ts">
	export let context : undefined | 'run-header' = undefined;
</script>


<style lang="scss">
	a {
		display: flex;
		flex-wrap: wrap;
		width: fit-content;
		align-items: center;
		flex-shrink: 0;
		flex-grow: 0;
		color: #1c1e21;
		text-decoration: none;
		font-family: system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";

		@media (prefers-color-scheme: dark) {
			color: #ecf0f1;
		}

		&:hover {
			color: #5468ff;

			img {
				transform: translateX(-2px) translateY(2px) scale(110%);
			}
		}
	}

	img {
		height: 2em;
		transition: transform 125ms ease-in-out;
	}

	strong {
		margin-left: 0.25rem;
	}

	.run-header {
		strong {
			display: none;

			@media (min-width: 600px) {
				display: block;
			}
		}
	}
</style>


<a
	class="code-comet-logo{ context ? ' ' + context : '' }"
	href="https://codecomet.io/"
	itemtype="http://schema.org/Corporation"
	itemscope
>
	<img
		src="/CodeComet-logo.svg"
		alt="CodeComet logo showing an illustrated comet entering the atmosphere"
		itemprop="image"
		title="visit the CodeComet website for more information"
	/>

	<strong itemprop="name">CodeComet</strong>
</a>
