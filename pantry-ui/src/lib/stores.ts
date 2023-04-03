import type { Writable } from 'svelte/store'

import { writable, derived } from 'svelte/store'


export type HighlightLineBounds = [ number, number ]


export const highlightAccordion : Writable<string> = writable('')
export const activeAccordion : Writable<string> = writable('')
export const activeModal : Writable<string> = writable('')

class HighlightLine {
	public active : Writable<string>


	constructor() {
		this.active = writable('')
	}


	get bounds() {
		return derived(
			[ this.active ],
			([ $active ]) : HighlightLineBounds => {
				let bounds : HighlightLineBounds = [ 0, 0 ]

				if ($active) {
					// does highlight contain a dash, indicating a range
					// if so, parse the upper and lower bounds
					if (/-/.test($active)) {
						bounds = $active
							.split('-')
							.map((item : string) => parseInt(item, 10)) as [ number, number ]
					} else {
						const lineNumber = parseInt($active, 10)

						bounds = [ lineNumber, lineNumber ]
					}
				}

				return bounds
			},
		)
	}
}

export const highlightLine = new HighlightLine()
