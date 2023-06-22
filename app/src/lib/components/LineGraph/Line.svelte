<script
	lang="ts"
	context="module"
>
	import type { Coordinate } from '$lib/types/aggregated-headline-data';
	import type { ScaleFunction } from '$lib/types/line-graph';

	import { draw } from 'svelte/transition';
	import { sineOut } from 'svelte/easing';
	import { line, curveMonotoneX } from 'd3-shape';
</script>

<script lang="ts">
	export let coordinates : Coordinate[];
	export let xScale      : ScaleFunction;
	export let yScale      : ScaleFunction;
	export let pathElement : SVGPathElement;
	export let isVisible   : boolean = false;

	const drawOptions = {
		duration : 1000,
		easing   : sineOut,
	};

	function getLine(coordinates : Coordinate[]) : string {
		const lineFunc = line()
			.x(([ x, y ] : Coordinate) => xScale(x))
			.y(([ x, y ] : Coordinate) => yScale(y))
			.curve(curveMonotoneX);

		return lineFunc(coordinates) as string;
	}
</script>


<style lang="scss">
	.path-line {
		fill: none;
		stroke: #239de2;
		stroke-linejoin: round;
		stroke-linecap: round;
		stroke-width: 2;
	}
</style>


{#if isVisible }
	<path
		bind:this={ pathElement }
		class="path-line"
		d={ getLine(coordinates) }
		in:draw={ drawOptions }
	></path>
{/if}
