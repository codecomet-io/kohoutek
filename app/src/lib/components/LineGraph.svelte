<script lang="ts">
	import { draw } from 'svelte/transition';

	import { extent } from 'd3-array';
	import { scaleLinear } from 'd3-scale';
	import { line, curveBasis } from 'd3-shape';


	type Coordinates = {
		x : number;
		y : number;
	};


	// props
	export let data : Coordinates[];

	// scales
	const xScale = scaleLinear()
		.domain(extent(data.map((d : Coordinates) => d.x)))
		.range([5, 95]);

	const yScale = scaleLinear()
		.domain(extent(data.map((d : Coordinates) => d.y)))
		.range([5, 75]);

	// the path generator
	const pathLine = line()
		.x((d : Coordinates) => xScale(d.x))
		.y((d : Coordinates) => yScale(d.y))
		.curve(curveBasis);
</script>


<style lang="scss">
	path {
		stroke: purple;
		stroke-width: 2;
		fill: none;
		stroke-linecap: round;
	}
</style>


<svg viewBox="0 0 100 100">
	<path
		transition:draw={ { duration: 2000 } }
		d={ pathLine(data) }
	/>
</svg>
