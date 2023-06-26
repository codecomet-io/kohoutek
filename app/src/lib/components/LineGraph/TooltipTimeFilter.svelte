<script
	lang="ts"
	context="module"
>
	import type { Coordinate } from '$types/aggregated-headline-data';
	import type { Padding, FormatValueFunction } from '$types/line-graph';

	import { HEK, gotoSearchString } from '$utilities/helper';
</script>

<script lang="ts">
	export let coordinates     : Coordinate[];
	export let formatXValue    : FormatValueFunction = (item) => item.toString();
	export let formatYValue    : FormatValueFunction = (item) => item.toString();
	export let xEndpoints      : Coordinate;
	export let width           : number;
	export let height          : number;
	export let padding         : Padding;
	export let xScale          : any;
	export let yScale          : any;
	export let pathLineElement : SVGPathElement;
	export let showTooltips    : boolean;
	export let timeFilterKey   : undefined | string;

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

	let clamps : [] | [ number ] | [ number, number ];

	function resetClamps(coordinates : Coordinate[]) : void {
		clamps = [];
	}

	$: resetClamps(coordinates);

	function updateSelectedClamps(clamp : number) : void {
		if (!timeFilterKey) {
			return;
		}

		if (clamps.length === 0) {
			clamps = [ clamp ];
		} else {
			const clampArr = [
				clamps[0],
				clamp,
			]
				.sort((a, b) => a - b);

			clamps = clampArr as [ number, number ];
		}

		if (clamps.length === 2) {
			updateFilter(clamps);
		}
	}

	function updateFilter(clamps : [ number, number ]) : void {
		const paramKey = `filter_${ timeFilterKey }`;

		gotoSearchString(paramKey, JSON.stringify(clamps));
	}
</script>


<style lang="scss">
	.time-filter-enabled {
		--clamp-opacity: 0.75;
		--clamp-fill: rgb(255, 148, 22);

		--clamp-range-opacity: 0.3;
		--clamp-range-fill: rgb(255, 196, 9);

		.clamp-trigger {
			&:hover,
			&:focus {
				opacity: var(--clamp-opacity);

				.visible-rect {
					fill: var(--clamp-fill);
				}
			}
		}

		&:not(.two-clamps-selected) {
			.clamp-trigger {
				cursor: pointer;
			}
		}

		&.clamp-selected {
			.selected-clamp {
				opacity: var(--clamp-opacity);

				.visible-rect {
					fill: var(--clamp-fill);
				}
			}

			.tooltip.tooltip {
				opacity: 0;
			}
		}

		&:hover {
			.time-filter-helper-text {
				opacity: 1;
				transition-duration: 400ms;
				transition-delay: 500ms;
			}
		}

		&.one-clamp-selected {
			.clamp-trigger {
				cursor: e-resize;

				&:hover,
				&:focus {
					// opacity: var(--clamp-opacity);

					// .visible-rect {
					// 	fill: var(--clamp-fill);
					// }

					~ .clamp-trigger {
						&:not(.first-clamp):not(.first-clamp ~ .clamp-trigger) {
							opacity: var(--clamp-range-opacity);

							.visible-rect {
								fill: var(--clamp-range-fill);
							}
						}
					}
				}
			}

			.first-clamp {
				~ .clamp-trigger {
					cursor: w-resize;
				}
			}

			&:hover {
				.first-clamp {
					~ .clamp-trigger {
						&:not(:hover):not(:hover ~ .clamp-trigger) {
							opacity: var(--clamp-range-opacity);

							.visible-rect {
								fill: var(--clamp-range-fill);
							}
						}
					}
				}
			}
		}

		&.two-clamps-selected {
			.selected-clamp {
				~ .clamp-trigger {
					&:not(.selected-clamp):not(.selected-clamp ~ .selected-clamp ~ .clamp-trigger) {
						opacity: var(--clamp-range-opacity);

						.visible-rect {
							fill: var(--clamp-range-fill);
						}
					}
				}
			}
		}
	}

	.tooltip-clamp-trigger,
	rect {
		outline: none;
	}

	.clamp-trigger,
	.tooltip {
		text {
			text-anchor: middle;
			font-weight: bold;
		}
	}

	.tooltip-clamp-trigger {
		opacity: 0;
	}

	.tooltip-trigger {
		&:hover,
		&:focus {
			~ .tooltip {
				opacity: 1;
			}
		}
	}

	.clamp-trigger {
		text {
			font-size: 0.725em;
			fill: hsl(0, 0%, 40%);

			@media (prefers-color-scheme: dark) {
				fill: hsl(0, 0%, 60%);
			}
		}
	}

	.tooltip {
		opacity: 0;
		pointer-events: none;
		transition: opacity 150ms ease-in-out;

		text,
		circle {
			fill: hsl(0, 0%, 10%);

			@media (prefers-color-scheme: dark) {
				fill: hsl(0, 0%, 90%);
			}
		}

		path {
			opacity: 0.75;
			fill: none;
			stroke-width: 1.5;
			stroke-dasharray: 1;
			stroke: hsl(0, 0%, 10%);

			@media (prefers-color-scheme: dark) {
				stroke: hsl(0, 0%, 90%);
			}
		}
	}

	.time-filter-helper-text {
		opacity: 0;
		text-anchor: end;
		font-size: 0.65em;
		font-weight: 700;
		letter-spacing: 0.4px;
		line-height: 16.8px;
		fill: rgb(102, 102, 102);
		text-transform: uppercase;
		transition: opacity 250ms ease-in-out;
	}
</style>


<g
	class:time-filter-enabled={ timeFilterKey }
	class:clamp-selected={ clamps.length > 0 }
	class:one-clamp-selected={ clamps.length === 1 }
	class:two-clamps-selected={ clamps.length === 2 }
>
	<!-- rectangles included atop the visualization to manage mouse events  -->
	{#each getCoordinates(pathLineElement) as coord }
		{@const [ x ] = coord }

		<!-- upon entering the rectangle, update the tooltip with the coordinates point behind the respective rectangle -->
		<g
			class="tooltip-clamp-trigger"
			class:tooltip-trigger={ showTooltips }
			class:clamp-trigger={ timeFilterKey }
			class:selected-clamp={ timeFilterKey && clamps.includes(x) }
			class:first-clamp={ timeFilterKey && x === clamps[0] }
			class:second-clamp={ timeFilterKey && x === clamps[1] }
			tabindex="0"
			transform="translate({ xScale( x ) } 0)"
			height={ height }
			on:mouseenter="{(event) => { handleTooltipTriggerMouseEnter(event, coord) }}"
			on:focus="{() => { updateTooltipCoordinates(coord) }}"
			on:click="{() => { updateSelectedClamps(x) }}"
			on:keydown={ (e) => HEK(e, () => updateSelectedClamps(x)) }

		>
			{#if timeFilterKey }
				{#if clamps.includes(x) }
					<text y="12.5">{ formatXValue( x ) }</text>
				{/if }

				{#if !showTooltips || clamps.length > 0 }
					<rect
						class="visible-rect"
						width={ rectangleWidth }
						height={ height - ( padding.top + padding.bottom ) }
						x={ rectangleWidth / 2 * -1 }
						y={ padding.top }
					/>
				{/if }
			{/if }

			<!-- width + 1 to avoid gaps between rectangles -->
			<rect
				width={ rectangleWidth + 1 }
				{ height }
				x={ ( rectangleWidth + 1 ) / 2 * -1 }
				opacity="0"
			/>
		</g>
	{/each}

	{#if showTooltips }
		<g
			class="tooltip"
			transform="translate({ xScale( tooltipCoordinates[0] ) } { yScale( tooltipCoordinates[1] ) })"
		>
			<text y="-10">{ formatYValue( tooltipCoordinates[1] ) }</text>

			<path d="M 0 0 v { height - padding.bottom - yScale( tooltipCoordinates[1] ) }" />

			<circle r="5" />
		</g>
	{/if }

	{#if timeFilterKey }
		<text
			class="time-filter-helper-text"
			x={ width }
			y="-5"
		>Select time filter</text>
	{/if }
</g>