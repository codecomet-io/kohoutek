<script
	lang="ts"
	context="module"
>
	import type { Coordinate } from '$types/aggregated-headline-data';
	import type { Padding, FormatValueFunction, XValueType, ScaleFunction } from '$types/line-graph';
	import type { ParseDisplayValueFunction } from '$types/data-table';

	import { onMount } from 'svelte';
	import { scaleLinear } from 'd3-scale';
	import { extent } from 'd3-array';
	import { roundToDecimals, parseDate } from 'briznads-helpers';

	import Axes from '$components/LineGraph/Axes.svelte';
	import Line from '$components/LineGraph/Line.svelte';
	import Area from '$components/LineGraph/Area.svelte';
	import TooltipTimeFilter from '$components/LineGraph/TooltipTimeFilter.svelte';
</script>

<script lang="ts">
	export let coordinates : Coordinate[];

	export let formatXValue  : FormatValueFunction | ParseDisplayValueFunction = defaultFormatValueFunction;
	export let formatYValue  : FormatValueFunction | ParseDisplayValueFunction = defaultFormatValueFunction;
	export let xValueType    : XValueType          = undefined;
	export let hideXTicks    : boolean             = false;
	export let hideYTicks    : boolean             = false;
	export let showTooltips  : boolean             = true;
	export let timeFilterKey : undefined | string  = undefined;

	let sanitizedCoordinates : Coordinate[] = [];

	function sanitizeCoordinates(coordinates : Coordinate[], xValueType : XValueType) : Coordinate[] {
		if (coordinates?.length > 1) {
			return coordinates;
		} else if (coordinates?.length === 1) {
			const [ x ] = coordinates[0];

			const addition = xValueType === 'date'
				? 1000 * 60 * 60 * 24
				: x;

			return [
				[ x - addition, 0 ],
				coordinates[0],
				[ x + addition, 0 ],
			];
		} else {
			return [];
		}
	}

	$: sanitizedCoordinates = sanitizeCoordinates(coordinates, xValueType);

	function parseXValueFunc(xValueType : XValueType, formatXValue : FormatValueFunction | ParseDisplayValueFunction) : FormatValueFunction | ParseDisplayValueFunction {
		return xValueType === 'date'
			? formatXDateValue
			: formatXValue ?? defaultFormatValueFunction;
	}

	$: formatXValue = parseXValueFunc(xValueType, formatXValue);

	function formatXDateValue(item : number, items : number[] = []) : string {
		const date = parseDate(item);

		const options : any = {
			month : 'short',
			day   : 'numeric',
		};

		const getYear = (item : number) => parseDate(item).getFullYear();

		const upper = items[ 0 ];
		const lower = items[ items.length - 1 ];

		if (getYear(upper) !== getYear(lower)) {
			options.year = 'numeric';
		}

		return date.toLocaleString(undefined, options);
	}

	function defaultFormatValueFunction(item : number) : string {
		return roundToDecimals(item).toString();
	}

	$: if (!formatYValue) {
		formatYValue = defaultFormatValueFunction;
	}

	let padding : Padding = {
		top    : 20,
		right  : 0,
		bottom : 20,
		left   : 32.5,
	};

	$: if (hideXTicks) {
		padding = {
			...padding,
			bottom : 0,
		};
	}

	$: if (hideYTicks) {
		padding = {
			...padding,
			left : 0,
		};
	}

	const width = 300;
	const height = width / 3;

	let xEndpoints : Coordinate;
	let yEndpoints : Coordinate;

	let xScale : ScaleFunction;
	let yScale : ScaleFunction;

	let pathLineElement : SVGPathElement;

	function init(coordinates : Coordinate[], padding : Padding) {
		if (coordinatesAreUnchanged(coordinates)) {
			return;
		}

		xEndpoints = parseEndpoints(coordinates, 'x');
		yEndpoints = parseEndpoints(coordinates, 'y');

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

	$: init(sanitizedCoordinates, padding);

	let cachedCoordStr : string;

	function coordinatesAreUnchanged(coordinates : Coordinate[]) : boolean {
		const coordStr = JSON.stringify(coordinates);

		const unchanged = coordStr === cachedCoordStr;

		if (!unchanged) {
			cachedCoordStr = coordStr;
		}

		return unchanged;
	}

	function parseEndpoints(coordinates : Coordinate[], axis : 'x' | 'y') : [ number, number ] {
		const endpoints = extent(
			coordinates,
			([ x, y ] : Coordinate) => axis === 'x'
				? x
				: y,
		) as [ number, number ];

		testEndpoints(endpoints);

		return endpoints;
	}

	function testEndpoints(endpoints : [ number, number ]) : void {
		if (endpoints[0] === endpoints[1]) {
			if (endpoints[0] == null) {
				endpoints[0] = 0;
				endpoints[1] = 10;
			} else if (endpoints[0] === 0) {
				endpoints[1] = 10;
			} else {
				endpoints[0] = 0;
			}
		}
	}

	// re-animate drawing the line & fading in the area when data changes
	let isVisible = false;

	function setVisible() : void {
		isVisible = false;

		setTimeout(() => isVisible = true, 1);
	}

	onMount(setVisible);
</script>


<style lang="scss">
	svg {
		width: 100%;
		height: auto;
		overflow: visible;
		position: relative;
	}
</style>


<svg viewBox="0 0 { width } { height }">
	<Axes
		coordinates={ sanitizedCoordinates }
		{ formatXValue }
		{ formatYValue }
		{ hideXTicks }
		{ hideYTicks }
		{ padding }
		{ height }
		{ xEndpoints }
		{ yEndpoints }
		{ xScale }
		{ yScale }
	/>

	{#if sanitizedCoordinates.length > 0 }
		<Line
			bind:pathElement={ pathLineElement }
			coordinates={ sanitizedCoordinates }
			{ xScale }
			{ yScale }
			{ isVisible }
		/>

		<Area
			coordinates={ sanitizedCoordinates }
			{ xScale }
			{ yScale }
			{ isVisible }
			{ yEndpoints }
		/>

		{#if showTooltips !== false || (xValueType === 'date' && timeFilterKey) }
			<TooltipTimeFilter
				coordinates={ sanitizedCoordinates }
				{ formatXValue }
				{ formatYValue }
				{ xEndpoints }
				{ width }
				{ height }
				{ padding }
				{ xScale }
				{ yScale }
				{ pathLineElement }
				{ showTooltips }
				{ timeFilterKey }
			/>
		{/if}
	{/if}
</svg>
