<script lang="ts">
	import { onMount } from 'svelte';
	import { select } from 'd3-selection';
  import { axisBottom, axisLeft } from 'd3-axis';

	import { objectEntries } from '$lib/helper';


	export let position : 'left' | 'bottom';
	export let innerWidth : number;
	export let innerHeight : number;
  export let scale : any;
	export let label : undefined | string = undefined;

	$: console.debug({
		innerHeight,
		position,
		scale,
	});

	let gElement : SVGGElement;

	let axis : any;

	let transform : string;

	const labelTransformMap : { translate : number[], rotate? : number[] } = {
		translate : [],
	};

	let labelTransform : string;

	function initAxis(position : 'left' | 'bottom', innerHeight : number, scale : any) : void {
		console.debug(0);

		if (position === 'left') {
			axis = axisLeft(scale)
				.tickSizeOuter(0);

			labelTransformMap.translate.push(-30, innerHeight / 2);

			labelTransformMap.rotate = [ -90 ];
		} else {
			axis = axisBottom(scale)
				.tickSizeOuter(0)
				.tickFormat((date : Date) => {
					console.debug(date);

					return date.toLocaleString(undefined, {
						month : 'short',
						day   : 'numeric',
					});
				});

			transform = `translate(0, ${ innerHeight })`;

			labelTransformMap.translate.push(innerWidth / 2, innerHeight + 35);
		}

		labelTransform = objectEntries(labelTransformMap)
			.map(([ key, value ]) => `${ key }(${ (value ?? []).join(', ') })`)
			.join(' ');

		if (gElement) {
			applyAxis();
		}
	}

	$: initAxis(position, innerHeight, scale);

	function applyAxis() : void {
		const selectedElement = select(gElement);

		selectedElement.selectAll('*').remove();

		selectedElement.call(axis);
	}

	onMount(applyAxis);
</script>


<style lang="scss">
	text {
		font-weight: bold;
		fill: black;
		stroke: rgba(255, 255, 255, 0.35);
		stroke-width: 0.5px;
	}
</style>


<g
	bind:this={ gElement }
	class="axis { position }"
	{ transform }
></g>

{#if label != null }
	<text
	text-anchor="middle"
	transform={ labelTransform }
	>{ label }</text>
{/if}
