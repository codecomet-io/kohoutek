<script lang="ts">
	import { isListPopulated } from 'briznads-helpers';

	import type { FilesetAction } from '$pantry/types';
	import type { Action } from '$pantry/types';


	export let items : FilesetAction[] | Action[];
</script>


<style lang="scss">
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 18px;
		margin-bottom: 10px;
	}

	h2 {
		margin-top: 0;
		margin-bottom: 0;
	}
</style>


{#if isListPopulated(items) }
	<header>
		<h2>
			{ items?.[0]?.type === 'fileset' ? 'Fileset' : 'Action' }{ items.length === 1 ? '' : 's' }
		</h2>

		<slot></slot>
	</header>
{/if}
