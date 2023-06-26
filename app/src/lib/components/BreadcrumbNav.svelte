<script
	lang="ts"
	context="module"
>
	import type { BreadcrumbCustomEvent } from '@ionic/core';

	import type { Pipeline, Run } from '$pantry/types';
</script>


<script lang="ts">
	export let org      : undefined | string;
	export let pipeline : undefined | Pipeline;
	export let run      : undefined | Run;

	let hiddenBreadcrumbPopover : HTMLIonPopoverElement;

	function handleCollapsedBreadcrumbClick(event : BreadcrumbCustomEvent) : void {
		if (!event?.detail?.collapsedBreadcrumbs) {
			return;
		}

		populateHiddenBreadcrumbPopover(event.detail.collapsedBreadcrumbs);

		hiddenBreadcrumbPopover.present(event);
	}

	function populateHiddenBreadcrumbPopover(hiddenBreadcrumbs : HTMLIonBreadcrumbElement[]) : void {
		const list = hiddenBreadcrumbPopover.querySelector('ion-list');

		if (!list) {
			return;
		}

		const listHtml : string = hiddenBreadcrumbs
			.map((item : HTMLIonBreadcrumbElement, index : number) => `
				<ion-item
					${ index === hiddenBreadcrumbs.length - 1 ? `lines="none"` : '' }
					href="${ item.href }"
					${ item.dataset?.disabled === 'true' ? `disabled="true"` : '' }
				>
					<ion-label>${ item.textContent }</ion-label>
				</ion-item>
			`)
			.join('');

		list.innerHTML = listHtml;
	}
</script>


<style lang="scss">
	ion-breadcrumbs {
		display: none;

		@media (min-width: 992px) {
			display: flex;
		}
	}

	ion-breadcrumb {
		max-width: 33.333vw;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;

		&[data-disabled="true"] {
			&::part(native) {
				cursor: default;
				opacity: 0.5;
				pointer-events: none;
			}
		}
	}

	.hidden-breadcrumb-popover {
		--width: min-content;
		--max-width: 80vw;
	}
</style>


<ion-breadcrumbs
	max-items={ 3 }
	on:ionCollapsedClick={ handleCollapsedBreadcrumbClick }
>
	<ion-breadcrumb href="/{ org }/pipelines">All Pipelines</ion-breadcrumb>

	{#if pipeline }
		<ion-breadcrumb
			href="/{ org }/pipeline/{ pipeline.id }"
			data-disabled="true"
		>{ pipeline.name }</ion-breadcrumb>

		<ion-breadcrumb href="/{ org }/pipeline/{ pipeline.id }/runs">All Pipeline Runs</ion-breadcrumb>

		{#if run }
			<ion-breadcrumb href="/{ org }/pipeline/{ pipeline.id }/run/{ run.id }">{ run.name }</ion-breadcrumb>
		{/if}
	{/if}
</ion-breadcrumbs>

<ion-popover
	class="hidden-breadcrumb-popover"
	bind:this={ hiddenBreadcrumbPopover }
	dismiss-on-select={ true }
>
	<ion-content>
		<ion-list></ion-list>
	</ion-content>
</ion-popover>
