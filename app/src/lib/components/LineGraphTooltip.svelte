<script lang="ts">
	import type { Coordinate } from '$lib/types/data-table';


	type FormatValueFunction = (item : number, items? : number[]) => string;


	export let formatYValue    : FormatValueFunction = (item) => item.toString();
	export let xEndpoints      : Coordinate;
	export let innerWidth      : number;
	export let height          : number;
	export let paddingBottom   : number;
	export let xScale          : any;
	export let yScale          : any;
	export let pathLineElement : SVGPathElement;

	const tooltipCount = 100;

	let rectangleWidth : number;

	$: rectangleWidth = innerWidth / ( tooltipCount - 1 );

	let activeTooltip : undefined | Coordinate;

	function getCoordinates(pathLineElement : SVGPathElement) : Coordinate[] {
		if (!pathLineElement?.getPointAtLength) {
			return [];
		}

		const equalDistribution = (xEndpoints[1] - xEndpoints[0]) / (tooltipCount - 1);

		return [...Array(tooltipCount)]
			.map((_, index) => equalDistribution * index + xEndpoints[0])
			.map((x : number) => [
				x,
				yScale.invert(getYForX(xScale(x), pathLineElement)),
			]);
	}

	// adapted from https://stackoverflow.com/a/17896375/418954
	function getYForX(x : number, path : SVGPathElement, error : number = 0.01, maxIterations : number = 50){
		const getMiddlePoint = () => path.getPointAtLength((end + start) / 2);

		let end       : number   = path.getTotalLength();
		let start     : number   = 0;
		let point     : DOMPoint = getMiddlePoint();
		let iteration : number   = 0;

		while (x < point.x - error || x > point.x + error) {
			point = getMiddlePoint();

			if (x < point.x) {
				end = (start + end) / 2;
			} else {
				start = (start + end) / 2;
			}

			if (maxIterations < ++iteration) {
				break;
			}
		}

		return point.y
	}

	function updateActiveTooltip(coord? : Coordinate) : void {
		activeTooltip = coord;
	}
</script>


<style lang="scss">
	.tooltip {
		text {
			font-weight: bold;
		}
	}
</style>


{#if activeTooltip }
	<g
		class="tooltip"
		fill="currentColor"
		transform="translate({ xScale( activeTooltip[0] ) } { yScale( activeTooltip[1] ) })"
	>
		<text
			text-anchor="middle"
			fill="hsl(0, 0%, 10%)"
			y="-10"
		>{ formatYValue( activeTooltip[1] ) }</text>

		<path
			opacity="0.75"
			fill="none"
			stroke="hsl(0, 0%, 10%)"
			stroke-width="1.5"
			stroke-dasharray="1"
			d="M 0 0 v { height - paddingBottom - yScale( activeTooltip[1] ) }"
		/>

		<circle r="5" fill="hsl(0, 0%, 10%)" />
	</g>
{/if}

<g
	on:mouseout={ () => updateActiveTooltip() }
	on:blur={ () => updateActiveTooltip() }
>
	{#each getCoordinates(pathLineElement) as coord }
		<!-- rectangles included atop the visualization to manage mouse events  -->
		<g transform="translate({ xScale( coord[0] ) } 0)">
			<!-- upon entering the rectangle, update the tooltip with the coordinates point behind the respective rectangle -->
			<!-- width + 1 to avoid gaps between rectangles -->
			<rect
				on:mouseenter="{() => { updateActiveTooltip(coord) }}"
				on:focus="{() => { updateActiveTooltip(coord) }}"
				opacity="0"
				width={ rectangleWidth + 1 }
				{ height }
				x={ rectangleWidth / 2 * -1 }
			/>
		</g>
	{/each}
</g>
