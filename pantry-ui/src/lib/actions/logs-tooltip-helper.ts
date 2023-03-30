export function logsTooltipHelper(element : HTMLElement) {
	let tooltipWrapper : HTMLElement

	function initElements() : void {
		// console.debug({ element })

		tooltipWrapper = element.offsetParent as HTMLElement

		const tooltip = tooltipWrapper?.querySelector('.tooltip') as HTMLElement

		if (!tooltip) {
			return
		}

		const tooltipHeight = tooltip.offsetHeight

		const scrollWrapper = tooltipWrapper.closest('.scroll-wrapper') as HTMLElement

		if (!scrollWrapper) {
			return
		}

		const scrollWrapperHeight = scrollWrapper.offsetHeight

		const bottomOfTooltip =
			tooltipWrapper.offsetTop
			+ tooltipWrapper.offsetHeight
			+ tooltipHeight
			+ 50 // we should clear the bottom of the modal by at least 50 pixels

		if (bottomOfTooltip <= scrollWrapperHeight) {
			setChecked()

			return
		}

		tooltipWrapper.classList.remove('default-position')

		setChecked()
	}

	function setChecked() : void {
		tooltipWrapper.style.overflow = 'visible'
	}

	setTimeout(() => initElements(), 100)

	return {
		destroy() {
			// nothing to destroy
		}
	}
}
