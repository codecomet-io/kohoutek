<script lang="ts">
	import type { Coordinate } from '$lib/types/data-table';

	import { roundToDecimals } from 'briznads-helpers';


	type FormatValueFunction = (item : number, items? : number[]) => string;

	type ScaleFunction = (input : number) => number;


	export let formatXValue : FormatValueFunction = (item) => item.toString();
	export let formatYValue : FormatValueFunction = (item) => item.toString();
	export let hideXTicks   : boolean = false;
	export let hideYTicks   : boolean = false;
	export let padding      : { top : number, right : number, bottom : number, left : number };
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
</script>


<style lang="scss">
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
				<text y="-4">{ formatYValue(tick, yTicks) }</text>
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
					transform="translate(-{ index === 0 ? padding.left : 0 }, 0)"
				>{ formatXValue(tick, xTicks) }</text>
			{/if }
		</g>
	{/each}
</g>
