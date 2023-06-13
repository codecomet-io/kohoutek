<script
	lang="ts"
	context="module"
>
	import type { Coordinate } from '$lib/types/data-table';
	import type { Padding, FormatValueFunction, XValueType, ScaleFunction } from '$lib/types/line-graph';

	import { onMount } from 'svelte';
	import { scaleLinear } from 'd3-scale';
	import { extent } from 'd3-array';
	import { roundToDecimals, parseDate } from 'briznads-helpers';

	import Axes from '$lib/components/LineGraph/Axes.svelte';
	import Line from '$lib/components/LineGraph/Line.svelte';
	import Area from '$lib/components/LineGraph/Area.svelte';
	import Tooltip from '$lib/components/LineGraph/Tooltip.svelte';
</script>

<script lang="ts">
	export let coordinates : Coordinate[];

	export let formatXValue : FormatValueFunction = (item : number) => roundToDecimals(item).toString();
	export let formatYValue : FormatValueFunction = (item : number) => roundToDecimals(item).toString();

	export let xValueType   : XValueType = undefined;
	export let hideXTicks   : boolean = false;
	export let hideYTicks   : boolean = false;
	export let showTooltips : boolean = true;

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

		xEndpoints = extent(coordinates, ([ x, y ] : Coordinate) => x) as [ number, number ];
		yEndpoints = extent(coordinates, ([ x, y ] : Coordinate) => y) as [ number, number ];

		testYEndpoints(yEndpoints);

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

	$: init(coordinates, padding);

	function getXValueFunc(xValueType : XValueType, formatXValue : FormatValueFunction) : FormatValueFunction {
		return xValueType === 'date'
			? formatXDateValue
			: formatXValue;
	}

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

	let cachedCoordStr : string;

	function coordinatesAreUnchanged(coordinates : Coordinate[]) : boolean {
		const coordStr = JSON.stringify(coordinates);

		const unchanged = coordStr === cachedCoordStr;

		if (!unchanged) {
			cachedCoordStr = coordStr;
		}

		return unchanged;
	}

	function testYEndpoints(endpoints : [ number, number ]) : void {
		if (endpoints[0] === endpoints[1]) {
			if (endpoints[0] === 0) {
				endpoints[1] = 100;
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
	}
</style>


<svg viewBox="0 0 { width } { height }">
	<Axes
		formatXValue={ getXValueFunc(xValueType, formatXValue) }
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

	<Line
		bind:pathElement={ pathLineElement }
		{ coordinates }
		{ xScale }
		{ yScale }
		{ isVisible }
	/>

	<Area
		{ coordinates }
		{ xScale }
		{ yScale }
		{ isVisible }
		{ yEndpoints }
	/>

	{#if showTooltips }
		<Tooltip
			{ formatYValue }
			{ xEndpoints }
			{ width }
			{ height }
			{ padding }
			{ xScale }
			{ yScale }
			{ pathLineElement }
		/>
	{/if}
</svg>
