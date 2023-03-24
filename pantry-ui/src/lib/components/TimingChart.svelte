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
		overflow: hidden;
		border-radius: 11px;
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

		&::after {
			content: '';
			position: absolute;
			left: 0;
			bottom: 0;
			width: 100%;
			height: 2px;
			pointer-events: none;
			background-color: inherit;
		}
	}
	a {
		display: block;
		width: 100%;
		height: 100%;
		background-color: rgba(255, 255, 255, 0.25);
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
		<li style="background-color: { getColor(index) }; flex-basis: { item.percent }%;">
			<a
				href="#{ item.digest }"
				title={ item.name }
				on:mouseover={ () => handleHoverFocus(item.digest, true) }
				on:mouseout={ () => handleHoverFocus(item.digest, false) }
				on:focus={ () => handleHoverFocus(item.digest, true) }
				on:blur={ () => handleHoverFocus(item.digest, false) }
				use:tooltip={ item }
			><span class="visually-hidden">{ item.name }</span></a>
		</li>
	{/each}
</ul>
