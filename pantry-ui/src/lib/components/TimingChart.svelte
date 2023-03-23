<script lang="ts">
	import type { TimingInfo } from '../../../../data_importer/lib/model'

	import Chart from 'svelte-frappe-charts'


	export let timingInfo : TimingInfo
</script>


<style lang="scss">
	.timing-chart-wrapper {
		margin-top: 15px;

		:global(.chart-draw-area) {
			transform: none;
		}

		:global(.chart-legend) {
			transform: translateY(50px);
		}
	}
</style>

<div class="timing-chart-wrapper">
	<Chart
		type="percentage"
		data={ timingInfo }
		height={ 75 }
		maxSlices={ 100 }
		barOptions={ { height : 25 } }
	/>
</div>
