<script lang="ts">
	import type { TimingInfo } from '../../../../pantry/src/lib/model';

	import { gotoSearchString } from '$lib/helper';

	import { highlight as highlightAccordion } from '$lib/stores/accordion';

	import { timingChartTooltipHelper } from '$lib/actions/timing-chart-tooltip-helper';

	import TimingInfoTooltip from '$lib/components/TimingInfoTooltip.svelte';


	export let timingInfo : TimingInfo[] = [];

	const colors : string[] = [
		'#ffc312',
		'#c4e538',
		'#12cbc4',
		'#fda7df',
		'#ed4c67',
		'#f79f1f',
		'#a3cb38',
		'#1289a7',
		'#d980fa',
		'#b53471',
		'#ee5a24',
		'#009432',
		'#0652dd',
		'#9980fa',
		'#833471',
		'#ea2027',
		'#006266',
		'#1b1464',
		'#5758bb',
		'#6f1e51',
	];

	function getColor(index : number) : string {
		return colors[ index % colors.length ];
	}

	function handleHoverFocus(id? : string) : void {
		highlightAccordion.set(id ?? '');
	}

	function handleClick(id : string) : void {
		gotoSearchString('active_accordion', id);
	}
</script>


<style lang="scss">
	%hover-focus-a-styling {
		transform: scaleY(115%);

		&::after {
			background-color: rgba(255, 255, 255, 0.05);
		}
	}

	%hover-focus-tooltip-styling {
		opacity: 1;
		pointer-events: auto;
		top: 100%;
	}

	ol {
		--border-radius: 11px;

		display: flex;
		margin-bottom: 0;
		padding: 0;
		list-style: none;
		position: relative;
		box-shadow: var(--drop-shadow);
		border-radius: var(--border-radius);
	}

	li {
		height: 25px;
		min-width: 7.5px;
		position: relative;
		transform-origin: center left;
		animation-duration: 1s;
		animation-timing-function: ease-in-out;
		animation-iteration-count: 1;
		animation-fill-mode: forwards;
		animation-name: animateIn;

		&:first-child {
			a {
				border-top-left-radius: var(--border-radius);
				border-bottom-left-radius: var(--border-radius);
			}
		}

		&:last-child {
			a {
				border-top-right-radius: var(--border-radius);
				border-bottom-right-radius: var(--border-radius);
			}
		}

		&:hover {
			a {
				@extend %hover-focus-a-styling;
			}

			:global(.tooltip) {
				@extend %hover-focus-tooltip-styling;
			}
		}
	}

	a {
		display: block;
		width: 100%;
		height: 100%;
		transition: transform 150ms ease-in-out;

		&::after {
			content: '';
			position: absolute;
			left: 0;
			top: 0;
			width: 100%;
			height: calc(100% - 2px);
			pointer-events: none;
			background-color: rgba(255, 255, 255, 0.15);
			transition: background-color 150ms ease-in-out;
		}

		&:focus {
			@extend %hover-focus-a-styling;

			outline: none;

			~ :global(.tooltip) {
				@extend %hover-focus-tooltip-styling;
			}
		}

		&.cached {
			&::before {
				content: '';
				position: absolute;
				left: 0;
				top: 0;
				width: 100%;
				height: 100%;
				background-image: url(data:image/svg+xml;charset=utf-8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuX0tYYzJqIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIiB3aWR0aD0iMyIgaGVpZ2h0PSIzIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48bGluZSB4MT0iMCIgeT0iMCIgeDI9IjAiIHkyPSIzIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMiIvPjwvcGF0dGVybj48L2RlZnM+IDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjcGF0dGVybl9LWGMyaikiIC8+PC9zdmc+);
				background-repeat: repeat;
				border-radius: inherit;
				opacity: 0.75;
			}
		}
	}

	@keyframes animateIn {
		0% {
			transform: scale(0, 1);
		}
		100% {
			transform: scale(1, 1);
		}
	}
</style>


<ol>
	{#each timingInfo as item, index }
		<li
			style="flex-basis: { item.percent }%;"
			title={ item.name }
			use:timingChartTooltipHelper
		>
			<a
				href="#{ item.id }"
				class:cached={ item.cached }
				style="background-color: { getColor(index) };"
				on:mouseover={ () => handleHoverFocus(item.id) }
				on:mouseout={ () => handleHoverFocus() }
				on:focus={ () => handleHoverFocus(item.id) }
				on:blur={ () => handleHoverFocus() }
				on:click|preventDefault={ () => handleClick(item.id) }
			><span class="visually-hidden">{ item.name }</span></a>

			<TimingInfoTooltip timingInfo={ item } />
		</li>
	{/each}
</ol>
