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

		const logContainer = tooltipWrapper.offsetParent as HTMLElement

		if (!logContainer) {
			return
		}

		const logContainerHeight = logContainer.offsetHeight

		const bottomOfTooltip =
			tooltipWrapper.offsetTop
			+ tooltipWrapper.offsetHeight
			+ tooltipHeight
			+ 10 // we should clear the bottom of the modal by at least 10 pixels

		if (bottomOfTooltip <= logContainerHeight) {
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
