<script lang="ts">
	import type { Coordinate } from '$lib/types/data-table';

	import { fade } from 'svelte/transition';
	import { sineInOut } from 'svelte/easing';
	import { area, curveMonotoneX } from 'd3-shape';


	type ScaleFunction = (input : number) => number;


	export let coordinates    : Coordinate[];
	export let xScale         : ScaleFunction;
	export let yScale         : ScaleFunction;
	export let yEndpoints     : Coordinate;
	export let isVisible      : boolean = false;

	const fadeOptions = {
		duration : 1000,
		delay    : 150,
		easing   : sineInOut,
	};

	function getArea(coordinates : Coordinate[]) : string {
		const areaFunc = area()
			.x(([ x, y ] : Coordinate) => xScale(x))
      .y0(() => yScale(yEndpoints[0]))
      .y1(([ x, y ] : Coordinate) => yScale(y))
      .curve(curveMonotoneX);

		return areaFunc(coordinates) as string;
	}
</script>


<style lang="scss"></style>


<linearGradient id="pathAreaBgGradient" gradientTransform="rotate(90)">
	<stop offset="5%" stop-color="#23C0E2" stop-opacity="0.5" />
	<stop offset="95%" stop-color="#2386E2" stop-opacity="0" />
</linearGradient>

{#if isVisible }
	<path
		d={ getArea(coordinates) }
		fill="url('#pathAreaBgGradient')"
		in:fade={ fadeOptions }
	></path>
{/if}
