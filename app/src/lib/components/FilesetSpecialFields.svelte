<script lang="ts">
	import type { FilesetAction } from '$pantry/types';

	import DetailField from '$components/DetailField.svelte';


	type SpecialField = {
		key : string
		value : string
	}


	export let fileset : FilesetAction;

	const specialFields : [ SpecialField | {}, SpecialField | {} ] = [{}, {}];

	$: {
		switch (fileset.filesetType) {
			case 'git':
				specialFields[0] = {
					key   : 'keep .git directory',
					value : fileset.keepDir,
				};

				break;

			case 'http':
				specialFields[0] = {
					key   : 'checksum',
					value : fileset.checksum,
				};

				specialFields[1] = {
					key   : 'filename',
					value : fileset.filename,
				};

				break;

			case 'docker': {
				specialFields[0] = {
					key   : 'force resolve',
					value : fileset.forceResolve
						? 'yes'
						: 'no',
				};

				let archKey = 'architecture';
				let archValue = fileset.architecture;

				if (archValue && fileset.variant) {
					archKey += '/variant';
					archValue += `/${ fileset.variant }`;
				}

				specialFields[1] = {
					key   : archKey,
					value : archValue,
				};

				break;
			}

			case 'local':
				specialFields[0] = {
					key   : 'include pattern',
					value : fileset.includePattern?.join(', '),
				};

				specialFields[1] = {
					key   : 'exclude pattern',
					value : fileset.excludePattern?.join(', '),
				};

				break;
		}
	}
</script>


<style lang="scss"></style>


{#each specialFields as field }
	<DetailField
		key={ field.key }
		value={ field.value }
		preserveEmptyColumn={ false }
	/>
{/each}
