<script lang="ts">
	import type { Run } from '$pantry/types';

	import { lapsed } from 'briznads-helpers';

	import ChunkyLabel from '$components/ChunkyLabel.svelte';
	import Ago from '$components/Ago.svelte';
	import StatusIcon from '$components/StatusIcon.svelte';
	import ModalHeader from '$components/ModalHeader.svelte';
	import RunInfoModalContent from '$components/RunInfoModalContent.svelte';


	export let run : Run;

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
	id="openRunInfoModal"
>
	<div class="title">
		<StatusIcon
			status={ run?.status }
			size="large"
		/>

		<h1>{ run?.name }</h1>
	</div>

	<ChunkyLabel>{ run?.status === 'completed' ? 'succeed' : 'fail' }ed <Ago date={ run?.completed } /> <span title="{ run?.runtime } milliseconds">in { lapsed(run?.runtime, false, true) }</span></ChunkyLabel>
</button>

<ion-modal
	trigger="openRunInfoModal"
	bind:this={ modalElement }
>
	<ModalHeader
		title="Run Info"
		dismissModal={ () => modalElement.dismiss(null, 'cancel') }
	></ModalHeader>

	<RunInfoModalContent { run } />
</ion-modal>
