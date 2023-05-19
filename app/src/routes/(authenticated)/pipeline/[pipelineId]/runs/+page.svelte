<script lang="ts">
	import type { PageData } from './$types';
	import type { Run } from '../../../../../../../pantry/src/lib/model';

	import { get } from 'briznads-helpers';
	import { chevronForwardOutline } from 'ionicons/icons';

	import StatusIcon from '$lib/components/StatusIcon.svelte';


	type Column = {
		name : string;
		size? : number;
		showHeader? : boolean;
	};


	export let data : PageData;

	$: console.debug(data)

	let runs : any[];

	$: runs = data.runs ?? [];

	const columns : Column[] = [
		{
			name : 'status',
			size : 0.5,
		},
		{
			name : 'name',
			size : 2.5,
		},
		{
			name : 'started',
		},
		{
			name : 'machineTime',
		},
		{
			name : 'actor.name',
		},
		{
			name : 'trigger',
		},
		{
			name : 'erroredActionName',
			size : 2,
		},
		{
			name : 'link',
			size : 0.3,
			showHeader : false,
		},
	];

	function parseGridTemplateColumns() : string {
		const percentArr = [];

		const totalColumnSpaces = columns.reduce((total, column) => total + (column.size ?? 1), 0);

		for (const column of columns) {
			const percent = 100 / totalColumnSpaces * (column.size ?? 1);

			percentArr.push(`${ percent }%`);
		}

		return percentArr.join(' ');
	}
</script>


<style lang="scss">
	.table-container {
		padding: 20px;
	}

	.row {
		display: grid;
		grid-template-columns: var(--grid-template-columns);
		align-items: center;
		border-bottom: 0.5px solid #c8c7cc;
	}

	a.row {
		position: relative;
		text-decoration: none;

		&::after {
			inset: 0px;
			position: absolute;
			content: '';
			opacity: 0;
			transition: background-color 200ms linear, opacity 200ms linear;
			z-index: -1;
		}

		&:hover,
		&:focus {
			&::after {
				background-color: #000;
				opacity: 0.04;
			}
		}
	}

	.cell {
		padding: 0.5em;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;

		&:first-child {
			padding-left: 0;
		}

		&:last-child {
			padding-right: 0;
		}

		&.invisible {
			visibility: hidden;
		}

		&.status,
		&.link {
			display: flex;
		}

		&.status {
			justify-content: center;
		}
	}

	ion-icon {
		font-size: 25px;
	}
</style>


<div
	class="table-container"
	style='--grid-template-columns:{ parseGridTemplateColumns() };'
>
	<ion-card-subtitle>Pipeline Name</ion-card-subtitle>

	<ion-card-title>All Pipeline Runs</ion-card-title>

  <div class="row header">
		{#each columns as column }
			<div
				class="cell { column.name.replace('.', '-') }"
				class:invisible={ column.showHeader === false }
			>{ column.name }</div>
		{/each}
	</div>

	{#each runs as run }
		<a
			class="row"
			href="/run/{ run.id }"
		>
			{#each columns as column }
				{@const value = get(run, column.name.split('.')) }

				<div
					class="cell { column.name.replace('.', '-') }"
					title={ value ?? undefined }
				>
					{#if column.name === 'status' }
						<StatusIcon
							size="small"
							status={ run[ column.name ] }
						/>
					{:else if column.name === 'link' }
						<ion-icon
							icon={ chevronForwardOutline }
							color="medium"
						></ion-icon>
					{:else}
						{ value ?? '' }
					{/if}
				</div>
			{/each}
		</a>
	{/each}
</div>
