<script lang="ts">
	import type { TimingInfo } from '../../../../data_importer/lib/model'

	import ChunkyLabel from '$lib/components/ChunkyLabel.svelte';


	export let timingInfo : TimingInfo
</script>


<style lang="scss">
	.tooltip,
	.tooltip-body {
		width: 250px;
		max-width: calc(100vw * 2 / 3);
	}

	.tooltip {
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

		&.cached {
			:global(ion-card-subtitle) {
				display: flex;
				gap: 5px;
				align-items: center;

				&::before {
					content: '';
					display: block;
					width: 1em;
					height: 1em;
					background-image: url(data:image/svg+xml;charset=utf-8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuX0tYYzJqIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIiB3aWR0aD0iMyIgaGVpZ2h0PSIzIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48bGluZSB4MT0iMCIgeT0iMCIgeDI9IjAiIHkyPSIzIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMiIvPjwvcGF0dGVybj48L2RlZnM+IDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjcGF0dGVybl9LWGMyaikiIG9wYWNpdHk9IjAuMyIvPjwvc3ZnPg==);
					background-repeat: repeat;
					border: 0.5px solid #666666;
				}
			}
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


<aside
	class="tooltip"
	class:cached={ timingInfo.cached }
>
	<div class="tooltip-body">
		<strong title={ timingInfo.name }>{ timingInfo.name }</strong>

		{#if timingInfo.cached }
			<ChunkyLabel>cached</ChunkyLabel>
		{:else}
			<ChunkyLabel allcaps={ false }>{ timingInfo.runtime }ms / { timingInfo.percent }%</ChunkyLabel>
		{/if}
	</div>
</aside>
