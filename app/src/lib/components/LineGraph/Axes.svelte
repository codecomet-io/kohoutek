<script
	lang="ts"
	context="module"
>
	import type { Coordinate } from '$lib/types/data-table';
	import type { FormatValueFunction, ScaleFunction, Padding } from '$lib/types/line-graph';

	import { roundToDecimals } from 'briznads-helpers';
</script>

<script lang="ts">
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

	$: xTicks = getTicks(xEndpoints);
	$: yTicks = getTicks(yEndpoints);

	function getTicks([ lower, upper ] : [ number, number ]) : [ number, number, number ] {
		const average = roundToDecimals((lower + upper) / 2, 1);

		return [
			lower,
			average,
			upper,
		];
	}

	function parseXTickTextAnchor(index : number, xTicks : number[], padding : Padding) : 'middle' | 'start' | 'end' {
		if (index === xTicks.length - 1) {
			return 'end';
		} else if (index === 0 && padding.left === 0) {
			return 'start';
		} else {
			return 'middle';
		}
	}
</script>


<style lang="scss">
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


<!-- y axis -->
<g class="axis y-axis" transform="translate(0, { padding.bottom })">
	{#each yTicks as tick, index }
		<g
			class="tick tick-{ index }"
			transform="translate(0, { yScale(tick) - padding.bottom })"
		>
			<line x2="100%"></line>

			{#if !hideYTicks }
				<text
					y="-4"
					text-anchor="start"
				>{ formatYValue(tick, yTicks) }</text>
			{/if}
		</g>
	{/each}
</g>

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
					y="-2"
					text-anchor={ parseXTickTextAnchor(index, xTicks, padding) }
				>{ formatXValue(tick, xTicks) }</text>
			{/if }
		</g>
	{/each}
</g>
