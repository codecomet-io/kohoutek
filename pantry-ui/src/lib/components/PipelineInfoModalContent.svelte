<script lang="ts">
	import type { Pipeline } from '../../../../data_importer/lib/model'

	import { getDateString, getTimeString } from '$lib/helper';

	import DetailField from '$lib/components/DetailField.svelte';


	export let pipeline : Pipeline
</script>


<style lang="scss">
	.flex-wrapper {
		display: flex;
		flex-wrap: wrap;
		gap: 1em;

		:global(.column-container) {
			--column-count: 2;

			flex: 0 0 calc((100% - (1em * (var(--column-count) - 1))) / var(--column-count));

			@media (min-width: 600px) {
				--column-count: 4;
			}
		}

		:global(.span-2-columns) {
			--column-count: 1;

			@media (min-width: 600px) {
				--column-count: 2;
			}
		}
	}
</style>


<ion-content class="ion-padding">
	<div class="flex-wrapper">
		<DetailField
			key="name"
			value={ pipeline?.name }
			customClass="span-2-columns"
			truncateOverflowText={ false }
		/>

		<DetailField
			key="description"
			value={ pipeline?.description }
			customClass="span-2-columns"
			truncateOverflowText={ false }
		/>

		<DetailField
			key="started at"
			value={ pipeline?.started ? getTimeString(pipeline?.started) : undefined }
			title={ pipeline?.started ? getDateString(pipeline?.started) : undefined }
		/>

		<DetailField
			key="ended at"
			value={ pipeline?.completed ? getTimeString(pipeline?.completed) : undefined }
			title={ pipeline?.completed ? getDateString(pipeline?.completed) : undefined }
		/>

		<DetailField
			key="status"
			value={ pipeline?.status }
		/>

		<DetailField
			key="trigger"
			value={ pipeline?.trigger }
		/>

		<DetailField
			key="total actions"
			value={ `${ pipeline?.actionsInfo.total }` }
		/>

		<DetailField
			key="cached actions"
			value={ `${ pipeline?.actionsInfo.cached }` }
		/>

		<DetailField
			key="errored actions"
			value={ `${ pipeline?.actionsInfo.errored }` }
		/>
	</div>
</ion-content>
