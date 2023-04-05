<script lang="ts">
	import type { FilesetAction, Action } from '../../../../data_importer/lib/model'

	import { gotoSearchString } from '$lib/helper'

	import { activeModal } from '$lib/stores'

	import ViewLogsButton from '$lib/components/ViewLogsButton.svelte'
	import ModalHeader from '$lib/components/ModalHeader.svelte'
	import ViewLogsModalContent from '$lib/components/ViewLogsModalContent.svelte'


	export let item : FilesetAction | Action

	let modalElement : HTMLIonModalElement

	function updateModalAndTooltip(modalElement : HTMLElement) : void {
		const scrollWrapper = modalElement.querySelector('ion-content .scroll-wrapper') as HTMLElement

		setModalHeight(modalElement, scrollWrapper)

		checkTooltipPosition(scrollWrapper)
	}

	function setModalHeight(modalElement : HTMLElement, scrollWrapper : HTMLElement) : void {
		if (modalElement.style.getPropertyValue('--height')) {
			return
		}

		const scrollWrapperHeight = (scrollWrapper.offsetHeight - scrollWrapper.clientHeight + scrollWrapper.scrollHeight) || 0

		const header = modalElement.querySelector('ion-header') as HTMLElement
		const headerHeight = header?.offsetHeight ?? 0

		modalElement.style.setProperty('--height', `${ headerHeight + scrollWrapperHeight }px`)
	}

	function checkTooltipPosition(scrollWrapper : HTMLElement) : void {
		const tooltipWrappers : NodeListOf<Element> = scrollWrapper.querySelectorAll('.tooltip-wrapper')

		if (!(tooltipWrappers && tooltipWrappers.length)) {
			return
		}

		tooltipWrappers.forEach((item : Element) => {
			const tooltipWrapper = item as HTMLElement

			const tooltip : HTMLElement | null = tooltipWrapper.querySelector('.tooltip')

			if (!tooltip) {
				return
			}

			const bottomOfTooltip =
				tooltipWrapper.offsetTop
				+ tooltipWrapper.offsetHeight
				+ tooltip.offsetHeight
				+ 50 // we should clear the bottom of the modal by at least 50 pixels

				if (bottomOfTooltip <= scrollWrapper.offsetHeight) {
					setTooltipChecked(tooltipWrapper)

					return
				}

				tooltipWrapper.classList.remove('default-position')

				setTooltipChecked(tooltipWrapper)
		})
	}

	function setTooltipChecked(tooltipWrapper : HTMLElement) : void {
		tooltipWrapper.style.overflow = 'visible'
	}

	function handleWillPresent(event : any) : void {
		updateActiveModal(true)

		setTimeout(() => updateModalAndTooltip(event.target), 10)
	}

	function updateActiveModal(active : boolean) : void {
		if (active) {
			gotoSearchString('active_modal', item.id)
		} else {
			gotoSearchString({
				'active_modal' : undefined,
				'highlight_line' : undefined,
			})
		}
	}
</script>


<style lang="scss">
	ion-modal {
		--min-height: 100vh;
		--max-height: 100vh;

		@media (min-width: 768px) {
			--width: calc(100vw - (16px * 2));
			--max-width: calc(1280px - (16px * 2));
			--min-height: calc(50vh - (16px * 2));
			--max-height: calc(100vh - (16px * 2));
			--height: auto;
		}
	}
</style>


{#if item.groupedLogs }
	<ViewLogsButton item={ item } />

	<ion-modal
		bind:this={ modalElement }
		is-open={ item.id === $activeModal }
		on:willPresent={ handleWillPresent }
		on:willDismiss={ () => updateActiveModal(false) }
	>
		<ModalHeader
			title="View Logs"
			dismissModal={ () => modalElement.dismiss(null, 'cancel') }
		></ModalHeader>

		<ViewLogsModalContent item={ item } />
	</ion-modal>
{/if}
