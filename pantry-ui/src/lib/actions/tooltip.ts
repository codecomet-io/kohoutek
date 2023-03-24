import type { TimingInfo } from '../../../../data_importer/lib/model'

import TimingInfoTooltip from '$lib/components/TimingInfoTooltip.svelte'


export function tooltip(element : HTMLElement, timingInfo : TimingInfo) {
	let title : string = ''
	let tooltipComponent : TimingInfoTooltip

	function handleMouseOver(event : any) {
		const { offsetX, offsetY, pageX, pageY } = event
		const { offsetWidth, offsetHeight } = element

		const x : number = pageX - offsetX + (offsetWidth / 2)
		const y : number = pageY - offsetY + offsetHeight

		// remove the `title` attribute, to prevent showing the default browser tooltip
		// remember to set it back on `mouseout`
		title = element.getAttribute('title') ?? ''

		element.removeAttribute('title')

		tooltipComponent = new TimingInfoTooltip({
			props : {
				x,
				y,
				timingInfo,
			},
			target : document.body,
		})
	}

	function handleMouseOut() {
		tooltipComponent.$destroy()

		// restore the `title` attribute
		element.setAttribute('title', title)
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
