<script lang="ts">
	import type { Pipeline } from '../../../../data_importer/src/lib/model';

	import { lapsed } from 'briznads-helpers';

	import ChunkyLabel from '$lib/components/ChunkyLabel.svelte';
	import Ago from '$lib/components/Ago.svelte';
	import StatusIcon from '$lib/components/StatusIcon.svelte';
	import ModalHeader from '$lib/components/ModalHeader.svelte';
	import PipelineInfoModalContent from '$lib/components/PipelineInfoModalContent.svelte';


	export let pipeline : Pipeline;

	let modalElement : HTMLIonModalElement;
</script>


<style lang="scss">
	.header {
		background-color: transparent;
		text-align: left;

		&:hover {
			opacity: 1;

			h1 {
				text-decoration: underline;
			}
		}
	}

	.title {
		display: flex;
		align-items: center;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		margin-bottom: 7px;

		:global(ion-icon) {
			flex-shrink: 0;
		}
	}

	h1 {
		margin-top: 0;
		margin-bottom: 0;
		margin-left: 0.25em;
		font-weight: 600;
		color: #000;

		@media (prefers-color-scheme: dark) {
			color: #fff;
		}

		&::after {
			content: url(data:image/svg+xml;charset=utf-8;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGNsYXNzPSJpb25pY29uIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiI+PHRpdGxlPkluZm9ybWF0aW9uIENpcmNsZTwvdGl0bGU+PHBhdGggZD0iTTI0OCA2NEMxNDYuMzkgNjQgNjQgMTQ2LjM5IDY0IDI0OHM4Mi4zOSAxODQgMTg0IDE4NCAxODQtODIuMzkgMTg0LTE4NFMzNDkuNjEgNjQgMjQ4IDY0eiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc3Ryb2tlLXdpZHRoPSIzMiIvPjxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMzIiIGQ9Ik0yMjAgMjIwaDMydjExNiIvPjxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc3Ryb2tlLXdpZHRoPSIzMiIgZD0iTTIwOCAzNDBoODgiLz48cGF0aCBkPSJNMjQ4IDEzMGEyNiAyNiAwIDEwMjYgMjYgMjYgMjYgMCAwMC0yNi0yNnoiLz48L3N2Zz4=);
			display: inline-block;
			width: 0.75em;
			padding-left: 0.25em;
			opacity: 0.4;
		}
	}
</style>


<button
	class="header"
	id="openPipelineInfoModal"
>
	<div class="title">
		<StatusIcon
			status={ pipeline?.status }
			size="large"
		/>

		<h1>{ pipeline?.name }</h1>
	</div>

	<ChunkyLabel>{ pipeline?.status === 'completed' ? 'succeed' : 'fail' }ed <Ago date={ pipeline?.completed } /> <span title="{ pipeline?.runtime } milliseconds">in { lapsed(pipeline?.runtime, false, true) }</span></ChunkyLabel>
</button>

<ion-modal
	trigger="openPipelineInfoModal"
	bind:this={ modalElement }
>
	<ModalHeader
		title="Pipeline Info"
		dismissModal={ () => modalElement.dismiss(null, 'cancel') }
	></ModalHeader>

	<PipelineInfoModalContent pipeline={ pipeline } />
</ion-modal>
