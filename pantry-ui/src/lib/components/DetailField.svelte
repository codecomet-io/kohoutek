<script lang="ts">
	export let key : string
	export let value : undefined | string = undefined
	export let title : undefined | string = undefined
	export let preserveEmptyColumn : boolean = true
	export let customClass : undefined | string | string[] = undefined

	const classes : string[] = [ 'column-container' ]

	$: if (customClass) {
		classes.push(...(typeof customClass === 'string' ? [ customClass ] : customClass))
	}
</script>


<style lang="scss">
	.column-container {
		flex: 1;
		min-width: 100px;
	}

	.key,
	.value {
		white-space: nowrap;
	}

	.key {
		margin-bottom: 4px;
		color: #57606a;
		font-size: 12px;
	}

	.value {
		display: block;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		color: #24292f;
		font-size: 16px;
		font-weight: 600;
	}
</style>


{#if (value || $$slots.default) || preserveEmptyColumn }
	<div class={ classes.join(' ') }>
		{#if value || $$slots.default }
			<header
				class="key"
				title={ title ?? value }
			>{ key }</header>

			<div
				class="value"
				title={ title ?? value }
			>
				<slot>
					{ value }
				</slot>
			</div>
		{/if}
	</div>
{/if}
