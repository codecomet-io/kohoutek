<script
	lang="ts"
	context="module"
>
	import type { Coordinate } from '$types/aggregated-headline-data';
	import type { ScaleFunction } from '$types/line-graph';

	import { fade } from 'svelte/transition';
	import { sineInOut } from 'svelte/easing';
</script>

<script lang="ts">
  export let coordinates : Coordinate[];
	export let xScale      : ScaleFunction;
	export let yScale      : ScaleFunction;
	export let isVisible   : boolean = false;

	const fadeOptions = {
		duration : 1000,
		delay    : 150,
		easing   : sineInOut,
	};
</script>


<style lang="scss">
	circle {
		fill: #fff;
		stroke: #239de2;
		stroke-width: 2;

		@media (prefers-color-scheme: dark) {
			fill: #000;
		}
	}
</style>


{#if isVisible }
	{#each coordinates as coord }
		<circle
			cx={ xScale(coord[0]) }
			cy={ yScale(coord[1]) }
			r="3"
			in:fade={ fadeOptions }
		></circle>
	{/each}
{/if}
