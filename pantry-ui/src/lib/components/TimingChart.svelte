<script lang="ts">
	import type { TimingInfo } from '../../../../data_importer/lib/model'

	import { createEventDispatcher } from 'svelte'

	import { tooltip } from '$lib/actions/tooltip'


	export let timingInfo : TimingInfo[]

	const colors : string[] = [
		'#00bdff',
		'#1b3bff',
		'#8f00ff',
		'#ff0011',
		'#ff7300',
		'#ffd600',
		'#00c30e',
		'#65ff00',
		'#d200ff',
		'#ff00ff',
		'#7d7d7d',
		'#5d5d5d',
	]

	function getColor(index : number) : string {
		return colors[ index % colors.length ]
	}

	const dispatch = createEventDispatcher()

	function handleHoverFocus(digest : string, active : boolean) : void {
		dispatch('highlightParent', { digest, active })
	}
</script>


<style lang="scss">
	ul {
		display: flex;
		margin-bottom: 0;
		padding: 0;
		list-style: none;
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
	}
	a {
		display: block;
		width: 100%;
		height: 100%;
		transition: transform 150ms ease-in-out;

		&.first {
			border-top-left-radius: 11px;
			border-bottom-left-radius: 11px;
		}

		&.last {
			border-top-right-radius: 11px;
			border-bottom-right-radius: 11px;
		}

		&::after {
			content: '';
			position: absolute;
			left: 0;
			top: 0;
			width: 100%;
			height: calc(100% - 2px);
			pointer-events: none;
			background-color: rgba(255, 255, 255, 0.25);
			transition: background-color 150ms ease-in-out;
		}

		&:hover {
			transform: scaleY(115%);

			&::after {
				background-color: rgba(255, 255, 255, 0.15);
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


<ul>
	{#each timingInfo as item, index }
		<li
			style="flex-basis: { item.percent }%;"
			title={ item.name }
			use:tooltip={ item }
		>
			<a
				class:first={ index === 0 }
				class:last={ index === timingInfo.length - 1 }
				href="#{ item.digest }"
				style="background-color: { getColor(index) };"
				on:mouseover={ () => handleHoverFocus(item.digest, true) }
				on:mouseout={ () => handleHoverFocus(item.digest, false) }
				on:focus={ () => handleHoverFocus(item.digest, true) }
				on:blur={ () => handleHoverFocus(item.digest, false) }
			><span class="visually-hidden">{ item.name }</span></a>
		</li>
	{/each}
</ul>
