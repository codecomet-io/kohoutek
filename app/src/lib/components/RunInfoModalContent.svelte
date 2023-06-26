<script lang="ts">
	import type { Run } from '$pantry/types';

	import { getDateString, getTimeString } from 'briznads-helpers';

	import DetailField from '$components/DetailField.svelte';


	export let run : Run;
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
			value={ run?.name }
			customClass="span-2-columns"
			truncateOverflowText={ false }
		/>

		<DetailField
			key="description"
			value={ run?.pipeline.description }
			customClass="span-2-columns"
			truncateOverflowText={ false }
		/>

		<DetailField
			key="started at"
			value={ run?.started ? getTimeString(run?.started) : undefined }
			title={ run?.started ? getDateString(run?.started) : undefined }
		/>

		<DetailField
			key="ended at"
			value={ run?.completed ? getTimeString(run?.completed) : undefined }
			title={ run?.completed ? getDateString(run?.completed) : undefined }
		/>

		<DetailField
			key="status"
			value={ run?.status }
		/>

		<DetailField
			key="trigger"
			value={ run?.trigger }
		/>

		<DetailField
			key="total actions"
			value={ `${ run?.stats.total }` }
		/>

		<DetailField
			key="cached actions"
			value={ `${ run?.stats.cached }` }
		/>

		<DetailField
			key="errored actions"
			value={ `${ run?.stats.errored }` }
		/>
	</div>
</ion-content>
