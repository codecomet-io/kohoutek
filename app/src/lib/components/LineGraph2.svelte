<script lang="ts">
	import type { Coordinate } from '$lib/types/runs-table';

	import {
		csv,
		extent,
		scaleLinear,
		scaleTime,
		line,
		curveNatural,
		timeFormat,
	} from 'd3';
	import { fly } from 'svelte/transition';
	import { parseDate } from 'briznads-helpers';

	import LineGraph2Axis from '$lib/components/LineGraph2Axis.svelte';


	interface TimestampCoordinate extends Coordinate {
		timestamp? : Date;
	}


	export let dataset : Coordinate[] = [];
	export let isTimestampXAxis : boolean = true;

	let parsedDataset : TimestampCoordinate[] = [];

	$: parsedDataset = isTimestampXAxis
		? dataset.map((coordinate : Coordinate) => ({
			...coordinate,
			timestamp: parseDate(coordinate.x),
		}))
		: dataset;

	const margin = { top: 15, bottom: 50, left: 50, right: 20 };

	const width = 900;

	const height = 600;

	const innerHeight = height - margin.top - margin.bottom;

	const innerWidth = width - margin.left - margin.right;

	// const tickFormat = (value) => timeFormat("%a")(value);

	$: xScale = scaleTime()
		.domain(extent(parsedDataset, (coord : TimestampCoordinate) => coord.timestamp))
		.range([0, innerWidth])
		.nice();

	$: yScale = scaleLinear()
		.domain(extent(parsedDataset, (coord : TimestampCoordinate) => coord.y))
		.range([innerHeight, 0])
		.nice();

	$: line_gen = line()
		.curve(curveNatural)
		.x((coord : TimestampCoordinate) => xScale(coord.timestamp))
		.y((coord : TimestampCoordinate) => yScale(coord.y))(parsedDataset);
</script>


<style lang="scss">
	circle {
		fill: #137880;
	}
	path {
		fill: transparent;
		stroke: rgb(18, 153, 90);
		stroke-width: 2.5;
		stroke-linejoin: round;
		stroke-dasharray: 4400;
		stroke-dashoffset: 0;
		animation: draw 8.5s ease;
	}
	@keyframes draw {
		from {
			stroke-dashoffset: 4400;
		}
		to {
			stroke-dashoffset: 0;
		}
	}
</style>


<main>
	<svg {width} {height}>
		<g transform={`translate(${margin.left},${margin.top})`}>
			<LineGraph2Axis {innerHeight} {margin} scale={xScale} position="bottom" />

			<LineGraph2Axis {innerHeight} {margin} scale={yScale} position="left" />

			<text transform={`translate(${-30},${innerHeight / 2}) rotate(-90)`}>Temperature</text>

			<path d={line_gen} />

			{#each parsedDataset as data, i}
				<circle
					cx={xScale(data.timestamp)}
					cy={yScale(data.y)}
					r="3"
					in:fly={{ duration: 5000, delay : i * 15 }}
				/>
			{/each}
			<text x={innerWidth / 2} y={innerHeight + 35}>Timestamp</text>
		</g>
	</svg>
</main>
