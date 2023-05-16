<script lang="ts"></script>


<style lang="scss">
	a {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		flex-shrink: 0;
		flex-grow: 0;
		padding: 0.5em;
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
		height: 2rem;
		transition: transform 125ms ease-in-out;
	}

	strong {
		margin-left: 0.25rem;
	}
</style>


<a
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
