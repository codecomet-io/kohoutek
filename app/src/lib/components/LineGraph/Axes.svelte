<script
	lang="ts"
	context="module"
>
	import type { Coordinate } from '$lib/types/aggregated-headline-data';
	import type { FormatValueFunction, ScaleFunction, Padding } from '$lib/types/line-graph';

	import { onMount } from 'svelte';

	import { roundToDecimals, sleep } from 'briznads-helpers';
</script>


<script lang="ts">
	export let coordinates  : Coordinate[];
	export let formatXValue : FormatValueFunction = (item) => item.toString();
	export let formatYValue : FormatValueFunction = (item) => item.toString();
	export let hideXTicks   : boolean = false;
	export let hideYTicks   : boolean = false;
	export let padding      : Padding;
	export let height       : number;
	export let xEndpoints   : Coordinate;
	export let yEndpoints   : Coordinate;
	export let xScale       : ScaleFunction;
	export let yScale       : ScaleFunction;

	let xTicks : number[];
	let yTicks : number[];

	$: xTicks = getXTicks(coordinates);
	$: yTicks = getYTicks(yEndpoints);

	function getXTicks(coordinates  : Coordinate[]) : number[] {
		let count = coordinates.length;

		if (count < 2) {
			count = 5;
		} else if (count === 2) {
			count = 3;
		} else if (count > 7) {
			count = 7;
		}

		const equalDistribution = (xEndpoints[1] - xEndpoints[0]) / (count - 1);

		return [...Array(count)]
			.map((_, index) => equalDistribution * index + xEndpoints[0]);
	}

	function getYTicks([ lower, upper ] : [ number, number ]) : [ number, number, number ] {
		const average = roundToDecimals((lower + upper) / 2, 1);

		return [
			lower,
			average,
			upper,
		];
	}

	let xAxisTickTextElements : SVGTextElement[] = [];

	async function testXTickOverlap(coordinates? : Coordinate[]) : Promise<void> {
		await sleep(10);

		xAxisTickTextElements
			.forEach((element) => element?.classList.remove('rotate'));

		let previousRightEdge : number = 0;
		let hasOverlap = false;

		for (const element of xAxisTickTextElements) {
			const { left, right } = element?.getClientRects()?.[0] ?? {};

			if (previousRightEdge && left < previousRightEdge + 1) {
				hasOverlap = true;

				break;
			}

			previousRightEdge = right;
		}

		if (!hasOverlap) {
			return;
		}

		xAxisTickTextElements
			.forEach((element) => element?.classList.add('rotate'));
	}

	onMount(testXTickOverlap);

	$: testXTickOverlap(coordinates);
</script>


<style lang="scss">
	.x-axis {
		text {
			text-anchor: middle;
			transition: transform 500ms 50ms ease-in-out;

			&.start {
				text-anchor: start;
			}

			&.end {
				text-anchor: end;
			}
		}

		// double up on ".rotate" class to add specificity
		// and overwrite upstream styles
		:global(text.rotate.rotate) {
			text-anchor: start;
			transform: translate(-6px, -3px) rotate(20deg);
		}
	}

	.y-axis {
		text {
			text-anchor: start;
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
		}
	}
</style>


<!-- x axis -->
<g class="axis x-axis">
	{#each xTicks as tick, index }
		<g
			class="tick tick-{ index }"
			transform="translate({ xScale(tick) }, { height })"
		>
			<line
				x1="0"
				y1="-{ height }"
				x2="0"
				y2="-{ padding.bottom }"
			></line>

			{#if !hideXTicks }
				<text
					bind:this={ xAxisTickTextElements[ index ] }
					y="-2"
					class:start={ index === 0 && padding.left === 0 }
					class:end={ index === xTicks.length - 1 }
				>{ formatXValue(tick, xTicks) }</text>
			{/if }
		</g>
	{/each}
</g>


<!-- y axis -->
<g class="axis y-axis" transform="translate(0, { padding.bottom })">
	{#each yTicks as tick, index }
		<g
			class="tick tick-{ index }"
			transform="translate(0, { yScale(tick) - padding.bottom })"
		>
			<line x2="100%"></line>

			{#if !hideYTicks }
				<text y="-4">{ formatYValue(tick, yTicks) }</text>
			{/if}
		</g>
	{/each}
</g>
