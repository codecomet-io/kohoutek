<script lang="ts">
	import type { TimingInfo } from '../../../../data_importer/lib/model'

	import { createEventDispatcher } from 'svelte'

	import { gotoSearchString } from '$lib/helper';

	import { tooltipHelper } from '$lib/actions/tooltip-helper'

	import TimingInfoTooltip from '$lib/components/TimingInfoTooltip.svelte'


	export let timingInfo : TimingInfo[] = []

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
	]

	function getColor(index : number) : string {
		return colors[ index % colors.length ]
	}

	const dispatch = createEventDispatcher()

	function handleHoverFocus(id : string, active : boolean, event : any) : void {
		dispatch('highlightParent', { id, active })
	}

	function handleClick(id : string) : void {
		gotoSearchString('active_accordion', id)
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
		:global(.tooltip) {
			opacity: 1;
			pointer-events: auto;
			top: 100%;
		}
	}

	ol {
		display: flex;
		margin-bottom: 0;
		padding: 0;
		list-style: none;
		position: relative;
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
				border-top-left-radius: 11px;
				border-bottom-left-radius: 11px;
			}
		}

		&:last-child {
			a {
				border-top-right-radius: 11px;
				border-bottom-right-radius: 11px;
			}
		}

		&:hover {
			a {
				@extend %hover-focus-a-styling;
			}

			@extend %hover-focus-tooltip-styling;
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

			~ {
				@extend %hover-focus-tooltip-styling;
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
			use:tooltipHelper
		>
			<a
				href="#{ item.id }"
				style="background-color: { getColor(index) };"
				on:mouseover={ (event) => handleHoverFocus(item.id, true, event) }
				on:mouseout={ (event) => handleHoverFocus(item.id, false, event) }
				on:focus={ (event) => handleHoverFocus(item.id, true, event) }
				on:blur={ (event) => handleHoverFocus(item.id, false, event) }
				on:click|preventDefault={ () => handleClick(item.id) }
			><span class="visually-hidden">{ item.name }</span></a>

			<TimingInfoTooltip timingInfo={ item } />
		</li>
	{/each}
</ol>
