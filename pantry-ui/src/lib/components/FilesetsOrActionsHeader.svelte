<script lang="ts">
	import type { FilesetAction } from '../../../../data_importer/lib/model';
	import type { Action } from '../../../../data_importer/lib/model';

	import { isPopulated } from '$lib/helper';


	export let items : FilesetAction[] | Action[]
</script>


<style lang="scss">
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 18px;
		margin-bottom: 10px;
		padding-left: 16px;
		padding-right: 16px;
	}

	h2 {
		margin-top: 0;
		margin-bottom: 0;
	}
</style>


{#if isPopulated(items) }
	<header>
		<h2>
			{ items?.[0]?.type === 'fileset' ? 'Fileset' : 'Action' }{ items.length === 1 ? '' : 's' }
		</h2>

		<slot></slot>
	</header>
{/if}
