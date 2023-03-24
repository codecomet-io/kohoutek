<script lang="ts">
	import type { TimingInfo } from '../../../../data_importer/lib/model'

	export let x : number
	export let y : number

	export let timingInfo : TimingInfo

	let contentX : number

	const width : number = 250
	const gutter : number = 16

	const halfWidthPlusGutter : number = width / 2 + gutter

	$: {
		contentX = x

		if (contentX < halfWidthPlusGutter) {
			contentX = halfWidthPlusGutter
		} else if (contentX + halfWidthPlusGutter > window.innerWidth) {
			contentX = window.innerWidth - halfWidthPlusGutter
		}
	}
</script>


<style lang="scss">
	.pointer,
	aside {
		position: absolute;
		transform: translateX(-50%);
	}

	.pointer {
		z-index: 1;
		border-left: 9px solid transparent;
		border-right: 9px solid transparent;
		border-bottom: 9px solid #ddd;

		&::before {
			content: '';
			position: absolute;
			left: -8px;
			top: 1px;
			border-left: 8px solid transparent;
			border-right: 8px solid transparent;
			border-bottom: 8px solid #fff;
		}
	}

	aside {
		max-width: calc(100vw * 2 / 3);
		padding: 8px;
		border-radius: 4px;
		background: #fff;
		border: 1px solid #ddd;
		box-shadow: 1px 1px 1px #ddd;
		font-size: 14px;

		strong {
			display: block;
			margin-bottom: 5px;
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
		}
	}
</style>


<div
	class="pointer"
	aria-hidden="true"
	style="left: { x }px; top: { y + 5 }px;"
></div>

<aside
	style="left: { contentX }px; top: { y + 13 }px; width: { width }px;"
>
	<strong>{ timingInfo.name }</strong>

	<div>{ timingInfo.runtime }ms / { timingInfo.percent }%</div>
</aside>
