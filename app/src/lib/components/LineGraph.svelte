<script lang="ts">
	import type { Coordinate } from '$lib/types/data-table';

	import { onMount } from 'svelte';
	import { scaleLinear } from 'd3-scale';
	import { extent } from 'd3-array';

	import LineGraphAxes from '$lib/components/LineGraphAxes.svelte';
	import LineGraphLine from '$lib/components/LineGraphLine.svelte';
	import LineGraphArea from '$lib/components/LineGraphArea.svelte';
	import LineGraphTooltip from '$lib/components/LineGraphTooltip.svelte';


	type FormatValueFunction = (item : number, items? : number[]) => string;


	export let coordinates : Coordinate[];

	export let formatXValue : FormatValueFunction = (item) => item.toString();
	export let formatYValue : FormatValueFunction = (item) => item.toString();

	export let hideYTicks   : boolean = false;
	export let showTooltips : boolean = true;

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

	$: innerWidth = width - padding.left - padding.right;

	let xEndpoints : Coordinate;
	let yEndpoints : Coordinate;

	let xScale : any;
	let yScale : any;

	let pathLineElement : SVGPathElement;

	function init(coordinates : Coordinate[]) {
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

	$: init(coordinates);

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
	<LineGraphAxes
		{ formatXValue }
		{ formatYValue }
		{ hideYTicks }
		{ padding }
		{ height }
		{ xEndpoints }
		{ yEndpoints }
		{ xScale }
		{ yScale }
	/>

	<LineGraphLine
		bind:pathElement={ pathLineElement }
		{ coordinates }
		{ xScale }
		{ yScale }
		{ isVisible }
	/>

	<LineGraphArea
		{ coordinates }
		{ xScale }
		{ yScale }
		{ isVisible }
		{ yEndpoints }
	/>

	{#if showTooltips }
		<LineGraphTooltip
			{ formatYValue }
			{ xEndpoints }
			{ innerWidth }
			{ height }
			{ xScale }
			{ yScale }
			{ pathLineElement }
			paddingBottom={ padding.bottom }
		/>
	{/if}
</svg>
