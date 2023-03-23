<script lang="ts">
	import type { TimingInfo } from '../../../../data_importer/lib/model'

	import { createEventDispatcher } from 'svelte';


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
		border-radius: 10px;
	}

	li {
		// flex-basis: 0%;
		height: 1.25em;
		min-width: 5px;
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
			><span class="visually-hidden">{ item.name }</span></a>
		</li>
	{/each}
</ul>
