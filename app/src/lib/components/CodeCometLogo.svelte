<script
	lang="ts"
	context="module"
>
	import CodeCometLogoInner from '$components/CodeCometLogoInner.svelte';
</script>


<script lang="ts">
	export let link : undefined | string = undefined;
	export let context : undefined | 'run-header' = undefined;

	const classes : string[] = [
		'code-comet-logo',
	];

	$: if (context) {
		classes.push(context);
	}

	const regex = /^https?:\/\//
</script>


<style lang="scss">
	.code-comet-logo {
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

			:global(img) {
				transform: translateX(-2px) translateY(2px) scale(110%);
			}
		}
	}

	.run-header {
		:global(strong) {
			display: none;
		}

		@media (min-width: 600px) {
			:global(strong) {
				display: block;
			}
		}
	}
</style>


{#if link }
	<a
		class={ classes.join(' ') }
		href={ link }
		target={ regex.test(link) ? '_blank' : null }
		itemtype="http://schema.org/Corporation"
		itemscope
	>
		<CodeCometLogoInner />
	</a>
{:else}
	<div
		class={ classes.join(' ') }
		itemtype="http://schema.org/Corporation"
		itemscope
	>
		<CodeCometLogoInner />
	</div>
{/if}
