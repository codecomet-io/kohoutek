<script lang="ts">
	import type { Coordinate } from '$lib/types/runs-table';

	import { onMount } from 'svelte';
	import { scaleLinear } from 'd3-scale';
	import { fade, draw, fly } from 'svelte/transition';
	import { linear, sineOut, sineInOut } from 'svelte/easing';

	import { getEndpoints } from '$lib/helper';


	type KeyPoints = {
		x : Bounds;
		y : Bounds;
	};

	type Bounds = {
		upper : number;
		lower : number;
	};


	export let coordinates : Coordinate[];

	const padding = { top: 20, right: 15, bottom: 20, left: 25 };

	const width = 1000;
	const height = 250;

	let xTicks : number[];
	let yTicks : number[];

	let xScale : any;
	let yScale : any;

	const keyPoints : KeyPoints = {
		x : {
			upper  : 0,
			lower  : 0,
		},
		y : {
			upper  : 0,
			lower  : 0,
		},
	};

	let path : string;
	let area : string;

	function initGraph(coordinates : Coordinate[]) {
		keyPoints.x = getEndpoints(coordinates, 'x', true);
		keyPoints.y = getEndpoints(coordinates, 'y', true);

		xTicks = parseTicks(Object.values(keyPoints.x) as [ number, number ]);
		yTicks = parseTicks(Object.values(keyPoints.y) as [ number, number ]);

		xScale = scaleLinear()
			.domain([ keyPoints.x.lower, keyPoints.x.upper ])
			.range([ padding.left, width - padding.right ]);

		yScale = scaleLinear()
			.domain([ keyPoints.y.lower, keyPoints.y.upper ])
			.range([ height - padding.bottom, padding.top ]);

		path = `M${ coordinates.map(p => `${ xScale(p.x) },${ yScale(p.y) }`).join('L') }`;

		area = `${ path }L${ xScale(keyPoints.x.upper) },${ yScale(0) }L${ xScale(keyPoints.x.lower) },${ yScale(0) }Z`;

		setVisible();
	}

	$: initGraph(coordinates);

	function parseTicks([ upper, lower ] : [ number, number ]) : [ number, number, number ] {
		const average = Math.round((upper + lower) / 2);

		return [
			upper,
			average,
			lower,
		];
	}

	let visible = false;

	function setVisible() : void {
		visible = false;

		setTimeout(() => visible = true, 1);
	}

	onMount(setVisible);
</script>


<style lang="scss">
	svg {
		position: relative;
		width: 100%;
		height: auto;
		overflow: visible;
	}

	.tick {
		font-size: .725em;
		font-weight: 200;

		&.tick-0 {
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

			.x-axis & {
				text-anchor: middle;
			}
		}
	}

	.path-line {
		fill: none;
		stroke: #239de2;
		stroke-linejoin: round;
		stroke-linecap: round;
		stroke-width: 2;
	}

	.path-area {
		fill: rgba(0, 100, 100, 0.2);
	}
</style>


<div class="chart">
	<svg viewBox="0 0 { width } { height }">
		<!-- y axis -->
		<g class="axis y-axis" transform="translate(0, {padding.top})">
			{#each yTicks as tick, index }
				<g
					class="tick tick-{ index }"
					transform="translate(0, { yScale(tick) - padding.bottom })"
				>
					<line x2="100%"></line>

					<text y="-4">{ tick } { index === 8 ? ' million sq km' : '' }</text>
				</g>
			{/each}
		</g>

		<!-- x axis -->
		<g class="axis x-axis">
			{#each xTicks as tick, index}
				<g
					class="tick tick-{ index }"
					transform="translate({xScale(tick)},{height})"
				>
					<line
						y1="-{ height }"
						y2="-{ padding.bottom }"
						x1="0"
						x2="0"
					></line>

					<text y="-2">{ tick }</text>
				</g>
			{/each}
		</g>

		{#if visible}
			<!-- data -->
			<path
				class="path-line"
				d={ path }
				in:draw={ { duration: 1250, easing : sineOut } }
			></path>

			<path
				class="path-area"
				d={ area }
				in:fade={ { duration: 1250, easing: sineInOut } }
			></path>
		{/if}
	</svg>
</div>
