<script lang="ts">
	import type { TimingInfo } from '../../../../data_importer/lib/model'

	import ChunkyLabel from '$lib/components/ChunkyLabel.svelte';


	export let timingInfo : TimingInfo
</script>


<style lang="scss">
	aside,
	.tooltip-body {
		width: 250px;
		max-width: calc(100vw * 2 / 3);
	}

	aside {
		padding-top: 13px;
		opacity: 0;
		pointer-events: none;
		top: calc(100% + 5px);
		transition-duration: 250ms;
		transition-timing-function: ease-in-out;
		transition-property: opacity, top;

		&,
		&::before,
		&::after {
			position: absolute;
			left: 50%;
			transform: translateX(-50%);
		}

		&::before,
		&::after {
			content: '';
		}

		&::before {
			top: 5px;
			border-left: 9px solid transparent;
			border-right: 9px solid transparent;
			border-bottom: 9px solid #ddd;
		}

		&::after {
			top: 6px;
			border-left: 8px solid transparent;
			border-right: 8px solid transparent;
			border-bottom: 8px solid #fff;
		}
	}

	.tooltip-body {
		position: absolute;
		padding: 8px;
		border-radius: 4px;
		background: #fff;
		border: 1px solid #ddd;
		box-shadow: 1px 1px 1px #ddd;
		font-size: 14px;

		strong {
			display: block;
			margin-bottom: 5px;
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
		}
	}
</style>


<aside class="tooltip">
	<div class="tooltip-body">
		<strong title={ timingInfo.name }>{ timingInfo.name }</strong>

		{#if timingInfo.cached }
			<ChunkyLabel>cached</ChunkyLabel>
		{:else}
			<ChunkyLabel allcaps={ false }>{ timingInfo.runtime }ms / { timingInfo.percent }%</ChunkyLabel>
		{/if}
	</div>
</aside>
