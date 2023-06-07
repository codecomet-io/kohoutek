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
	import { draw, fly } from 'svelte/transition';
	import { parseDate } from 'briznads-helpers';

	import LineGraph2Axis from '$lib/components/LineGraph2Axis.svelte';


	interface TimestampCoordinate extends Coordinate {
		timestamp? : Date;
	}


	export let dataset : Coordinate[] = [];
	export let isTimestampXAxis : boolean = true;
	export let xLabel : undefined | string = undefined;
	export let yLabel : undefined | string = undefined;

	const width : number = 1000;
	const height : number = 250;

	const margin = {
		top    : 0,
		right  : 0,
		bottom : 50,
		left   : 50,
	};

	const innerHeight : number = height - ( margin.top + margin.bottom );

	const innerWidth : number = width - ( margin.left + margin.right );

	let parsedDataset : TimestampCoordinate[] = [];

	let xScale : any;
	let yScale : any;

	let generatedLine : string;

	function initGraph(dataset : Coordinate[], isTimestampXAxis : boolean) {
		parsedDataset = isTimestampXAxis
			? dataset.map((coordinate : Coordinate) => ({
				...coordinate,
				timestamp: parseDate(coordinate.x),
			}))
			: dataset;

		xScale = scaleTime()
			.domain(extent(parsedDataset, (coord : TimestampCoordinate) => coord.timestamp))
			.range([0, innerWidth])
			.nice();

		yScale = scaleLinear()
			.domain(extent(parsedDataset, (coord : TimestampCoordinate) => coord.y))
			.range([innerHeight, 0])
			.nice();

		generatedLine = line()
			.curve(curveNatural)
			.x((coord : TimestampCoordinate) => xScale(coord.timestamp))
			.y((coord : TimestampCoordinate) => yScale(coord.y))(parsedDataset);
	}

	$: initGraph(dataset, isTimestampXAxis);
</script>


<style lang="scss">
	circle {
		fill: #239de2;
	}

	path {
		fill: transparent;
		stroke: rgba(35, 157, 226, 0.5);
		stroke-width: 2.5;
		// stroke-linejoin: round;
		// stroke-dasharray: 4400;
		// stroke-dashoffset: 0;
		// animation: draw 3s linear;
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


<svg viewBox="0 0 1000 250">
	<g transform="translate({ margin.left }, { margin.top })">
		<LineGraph2Axis
			{ innerWidth }
			{ innerHeight }
			scale={ yScale }
			position="left"
			label={ yLabel }
		/>

		<LineGraph2Axis
			{ innerWidth }
			{ innerHeight }
			scale={ xScale }
			position="bottom"
			label={ xLabel }
		/>

		<path
			d={ generatedLine }
			in:draw={ { duration : 1000 } }
		/>

		{#each parsedDataset as data, i }
			<circle
				cx={ xScale(data.timestamp) }
				cy={ yScale(data.y) }
				r="4"
				in:fly={{ duration: 5000, delay : i * 15 }}
			/>
		{/each}
	</g>
</svg>
