<script
	lang="ts"
	context="module"
>
	import type { Coordinate } from '$lib/types/aggregated-headline-data';
	import type { Padding, FormatValueFunction } from '$lib/types/line-graph';
</script>

<script lang="ts">
	export let formatYValue    : FormatValueFunction = (item) => item.toString();
	export let xEndpoints      : Coordinate;
	export let width           : number;
	export let height          : number;
	export let padding         : Padding;
	export let xScale          : any;
	export let yScale          : any;
	export let pathLineElement : SVGPathElement;

	const tooltipCount = 100;

	let rectangleWidth : number;

	$: rectangleWidth = ( width - padding.left - padding.right ) / ( tooltipCount - 1 );

	let tooltipCoordinates : Coordinate = [ 0, 0 ];

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

	function handleTooltipTriggerMouseEnter(event : any, coord : Coordinate) : void {
		event?.target?.focus();
		event?.target?.blur();

		updateTooltipCoordinates(coord);
	}

	function updateTooltipCoordinates(coord : Coordinate) : void {
		tooltipCoordinates = coord;
	}
</script>


<style lang="scss">
	.tooltip-trigger,
	rect {
		outline: none;
	}

	.tooltip-trigger {
		opacity: 0;

		&:hover,
		&:focus {
			~ .tooltip {
				opacity: 1;
			}
		}
	}

	.tooltip {
		opacity: 0;
		pointer-events: none;
		transition-property: opacity;
		transition-duration: 150ms;
		transition-timing-function: ease-in-out;

		text {
			font-weight: bold;
		}
	}
</style>


<!-- rectangles included atop the visualization to manage mouse events  -->
{#each getCoordinates(pathLineElement) as coord }
	<!-- upon entering the rectangle, update the tooltip with the coordinates point behind the respective rectangle -->
	<g
		class="tooltip-trigger"
		tabindex="0"
		transform="translate({ xScale( coord[0] ) } 0)"
		on:mouseenter="{(event) => { handleTooltipTriggerMouseEnter(event, coord) }}"
		on:focus="{() => { updateTooltipCoordinates(coord) }}"
	>
		<!-- width + 1 to avoid gaps between rectangles -->
		<rect
			width={ rectangleWidth + 1 }
			{ height }
			x={ rectangleWidth / 2 * -1 }
		/>
	</g>
{/each}

<g
	class="tooltip"
	fill="currentColor"
	transform="translate({ xScale( tooltipCoordinates[0] ) } { yScale( tooltipCoordinates[1] ) })"
>
	<text
		text-anchor="middle"
		fill="hsl(0, 0%, 10%)"
		y="-10"
	>{ formatYValue( tooltipCoordinates[1] ) }</text>

	<path
		opacity="0.75"
		fill="none"
		stroke="hsl(0, 0%, 10%)"
		stroke-width="1.5"
		stroke-dasharray="1"
		d="M 0 0 v { height - padding.bottom - yScale( tooltipCoordinates[1] ) }"
	/>

	<circle r="5" fill="hsl(0, 0%, 10%)" />
</g>
