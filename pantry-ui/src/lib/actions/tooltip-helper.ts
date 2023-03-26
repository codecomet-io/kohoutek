export function tooltipHelper(element : HTMLElement) {
	const link = element.querySelector('a')

	let title : string | null

	function handleMouseOver() {
		// on hover focus, then blur the current link, to insure no other links will have retained focus
		if (link && link instanceof HTMLElement) {
			link.focus()

			link.blur()
		}

		handleMouseOverOrFocus()
	}

	function handleMouseOverOrFocus() {
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

		const parent = element.offsetParent

		if (!(parent && parent instanceof HTMLElement)) {
			return
		}

		const containerWidth = parent.offsetWidth

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

	function handleMouseOutOrBlur() {
		// restore the title attribute
		if (title) {
			element.setAttribute('title', title)
		}
	}

	function initEvents() : void {
		element.addEventListener('mouseover', handleMouseOver)
		element.addEventListener('mouseout', handleMouseOutOrBlur)

		link?.addEventListener('focus', handleMouseOverOrFocus)
		link?.addEventListener('blur', handleMouseOutOrBlur)
	}

	initEvents()

	return {
		destroy() {
			element.removeEventListener('mouseover', handleMouseOver)
			element.removeEventListener('mouseout', handleMouseOutOrBlur)

			link?.removeEventListener('focus', handleMouseOverOrFocus)
			link?.removeEventListener('blur', handleMouseOutOrBlur)
		}
	}
}
