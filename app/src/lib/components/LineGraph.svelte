<script lang="ts">
	import type { Coordinate } from '$lib/types/runs-table';

	import { onMount } from 'svelte';
	import { fade, draw } from 'svelte/transition';
	import { sineOut, sineInOut } from 'svelte/easing';
	import { scaleLinear } from 'd3-scale';
	import { extent } from 'd3-array';
	import { line, area, curveMonotoneX } from 'd3-shape';
	import { roundToDecimals } from 'briznads-helpers';


	type FormatTicksFunction = (tick : number, ticks : number[]) => string;


	export let coordinates : Coordinate[];

	export let formatXTicks : undefined | FormatTicksFunction = undefined;
	export let formatYTicks : undefined | FormatTicksFunction = undefined;

	export let hideYTicks : boolean = false;

	const padding = {
		top    : 20,
		right  : 0,
		bottom : 20,
		left   : 32.5,
	};

	$: if (hideYTicks) {
		padding.left = 0;
	}

	const width = 300;
	const height = width / 3;

	const inDraw = {
		duration : 1000,
		easing   : sineOut,
	};

	const inFade = {
		...inDraw,
		easing : sineInOut,
		delay  : 150,
	};

	let xEndpoints : [ number, number ];
	let yEndpoints : [ number, number ];

	let xTicks : number[];
	let yTicks : number[];

	let xScale : any;
	let yScale : any;

	function initGraph(coordinates : Coordinate[]) {
		if (coordinatesAreUnchanged(coordinates)) {
			return;
		}

		xEndpoints = extent(coordinates, (coord : Coordinate) => coord.x) as [ number, number ];
		yEndpoints = extent(coordinates, (coord : Coordinate) => coord.y) as [ number, number ];

		testYEndpoints(yEndpoints);

		xTicks = parseTicks(xEndpoints);
		yTicks = parseTicks(yEndpoints);

		xScale = scaleLinear()
			.domain(xEndpoints)
			.rangeRound([ padding.left, width - padding.right ])
			.clamp(true);

		yScale = scaleLinear()
			.domain(yEndpoints)
			.rangeRound([ height - padding.bottom, padding.top ])
			.clamp(true);

		setVisible();
	}

	$: initGraph(coordinates);

	let cachedCoordStr : string;

	function coordinatesAreUnchanged(coordinates : Coordinate[]) : boolean {
		const coordStr = JSON.stringify(coordinates);

		const unchanged = coordStr === cachedCoordStr;

		if (!unchanged) {
			cachedCoordStr = coordStr;
		}

		return unchanged;
	}

	function testYEndpoints(yEndpoints : [ number, number ]) : void {
		if (yEndpoints[0] === yEndpoints[1]) {
			if (yEndpoints[0] === 0) {
				yEndpoints[0] = 0;
				yEndpoints[1] = 100;
			} else {
				yEndpoints[1] = yEndpoints[0] * 2;
				yEndpoints[0] = 0;
			}
		}
	}

	function parseTicks([ lower, upper ] : [ number, number ]) : [ number, number, number ] {
		const average = roundToDecimals((lower + upper) / 2, 1);

		return [
			lower,
			average,
			upper,
		];
	}

	let visible = false;

	function setVisible() : void {
		visible = false;

		setTimeout(() => visible = true, 1);
	}

	onMount(setVisible);

	function getLine(coordinates : Coordinate[]) : string {
		const lineFunc = line()
			.x((coord : Coordinate) => xScale(coord.x))
			.y((coord : Coordinate) => yScale(coord.y))
			.curve(curveMonotoneX);

		return lineFunc(coordinates);
	}

	function getArea(coordinates : Coordinate[]) : string {
		const areaFunc = area()
			.x((coord : Coordinate) => xScale(coord.x))
      .y0(() => yScale(0))
      .y1((coord : Coordinate) => yScale(coord.y))
      .curve(curveMonotoneX);

		return areaFunc(coordinates);
	}
</script>


<style lang="scss">
	svg {
		width: 100%;
		height: auto;
		overflow: visible;
	}

	.x-axis {
		.tick {
			text {
				text-anchor: middle;
			}

			&:first-child {
				text {
					text-anchor: start;
				}
			}

			&:last-child {
				text {
					text-anchor: end;
				}
			}
		}
	}

	.tick {
		font-size: 0.725em;
		font-weight: 200;

		&:first-child {
			line {
				stroke-dasharray: 0;
			}
		}

		line {
			stroke: #aaa;
			stroke-dasharray: 2;
		}

		text {
			fill: #666;
			text-anchor: start;
		}
	}

	.path-line {
		fill: none;
		stroke: #239de2;
		stroke-linejoin: round;
		stroke-linecap: round;
		stroke-width: 2;
	}
</style>


<div class="chart">
	<svg viewBox="0 0 { width } { height }">
		<!-- y axis -->
		<g class="axis y-axis" transform="translate(0, { padding.top })">
			{#each yTicks as tick, index }
				<g
					class="tick tick-{ index }"
					transform="translate(0, { yScale(tick) - padding.bottom })"
				>
					<line x2="100%"></line>

					{#if !hideYTicks }
						<text y="-4">{ formatYTicks ? formatYTicks(tick, yTicks) : tick }</text>
					{/if}
				</g>
			{/each}
		</g>

		<!-- x axis -->
		<g class="axis x-axis">
			{#each xTicks as tick, index }
				<g
					class="tick tick-{ index }"
					transform="translate({ xScale(tick) },{ height })"
				>
					<line
						y1="-{ height }"
						y2="-{ padding.bottom }"
						x1="0"
						x2="0"
					></line>

					<text
						y="-2"
						transform="translate(-{ index === 0 ? padding.left : 0 }, 0)"
					>{ formatXTicks ? formatXTicks(tick, xTicks) : tick }</text>
				</g>
			{/each}
		</g>

		<linearGradient id="pathAreaBgGradient" gradientTransform="rotate(90)">
			<stop offset="5%" stop-color="#23C0E2" stop-opacity="0.5" />
			<stop offset="95%" stop-color="#2386E2" stop-opacity="0" />
		</linearGradient>

		{#if visible}
			<!-- data -->
			<path
				class="path-line"
				d={ getLine(coordinates) }
				in:draw={ inDraw }
			></path>

			<path
				d={ getArea(coordinates) }
				fill="url('#pathAreaBgGradient')"
				in:fade={ inFade }
			></path>
		{/if}
	</svg>
</div>
