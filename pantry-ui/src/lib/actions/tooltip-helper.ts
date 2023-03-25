export function tooltipHelper(element : HTMLElement) {
	let title : string | null

	function handleMouseOver() {
		// remove the title attribute, to prevent showing the default browser tooltip
		// remember to set it back on `mouseout`
		title = element.getAttribute('title')

		element.removeAttribute('title')

		checkOverflow()
	}

	function checkOverflow() : void {
		if (element.dataset.overflowChecked) {
			return
		}

		const tooltipBody = element.querySelector('.tooltip-body')

		if (!(tooltipBody && tooltipBody instanceof HTMLElement)) {
			return
		}

		const halfTooltipWidth = tooltipBody.offsetWidth / 2

		const { offsetWidth, offsetLeft } = element

		const halfElementWidth = offsetWidth / 2

		let leftOffset = halfTooltipWidth - (halfElementWidth + offsetLeft)

		if (leftOffset > 0) {
			// because of the rounded corners the pointy bit looks weird if the box is too far over
			if (halfTooltipWidth - leftOffset < 11) {
				leftOffset = halfTooltipWidth - 11
			}

			tooltipBody.style.left = `${ leftOffset }px`

			setChecked()

			return
		}

		const { offsetParent } = element

		if (!(offsetParent && offsetParent instanceof HTMLElement)) {
			return
		}

		const containerWidth = offsetParent.offsetWidth

		// the opposite of element offsetLeft
		// the number of pixels from the element's right edge to the right edge of the offsetParent node
		const offsetRight = containerWidth - (offsetLeft + offsetWidth)

		let rightOffset = halfTooltipWidth - (halfElementWidth + offsetRight)

		if (rightOffset > 0) {
			// because of the rounded corners the pointy bit looks weird if the box is too far over
			if (halfTooltipWidth - rightOffset < 11) {
				rightOffset = halfTooltipWidth - 11
			}

			tooltipBody.style.right = `${ rightOffset }px`

			setChecked()

			return
		}

		setChecked()
	}

	function setChecked() : void {
		element.dataset.overflowChecked = 'true'
	}

	function handleMouseOut() {
		// restore the title attribute
		if (title) {
			element.setAttribute('title', title)
		}
	}

	element.addEventListener('mouseover', handleMouseOver)
	element.addEventListener('mouseout', handleMouseOut)

	return {
		destroy() {
			element.removeEventListener('mouseover', handleMouseOver)
			element.removeEventListener('mouseout', handleMouseOut)
		}
	}
}
