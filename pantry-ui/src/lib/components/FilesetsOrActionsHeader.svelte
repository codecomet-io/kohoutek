<script lang="ts">
	import type { FilesetAction } from '../../../../data_importer/lib/model';
	import type { Action } from '../../../../data_importer/lib/model';


	export let filesets : FilesetAction[] | undefined = undefined
	export let actions : Action[] | undefined = undefined

	function isPopulated(list : typeof filesets | typeof actions) : boolean {
		return Array.isArray(list) && list.length > 0
	}
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


{#if isPopulated(filesets) || isPopulated(actions) }
	<header>
		<h2>
			{#if filesets && isPopulated(filesets) }
				Fileset{ filesets.length === 1 ? '' : 's' }
			{:else if actions && isPopulated(actions) }
				Action{ actions.length === 1 ? '' : 's' }
			{/if}
		</h2>

		<slot></slot>
	</header>
{/if}
