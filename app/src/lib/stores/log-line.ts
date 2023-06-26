import type { Writable, Readable } from 'svelte/store';

import type { HighlightLogLineBounds } from '$types/log-line';

import { writable, derived } from 'svelte/store';


export const highlight : Writable<string> = writable('');

export const bounds : Readable<HighlightLogLineBounds> = derived(
	highlight,
	($active) : HighlightLogLineBounds => {
		let bounds : HighlightLogLineBounds = [ 0, 0 ];

		if ($active) {
			// does highlight contain a dash, indicating a range
			// if so, parse the upper and lower bounds
			if (/-/.test($active)) {
				bounds = $active
					.split('-')
					.map((item : string) => parseInt(item, 10)) as [ number, number ];
			} else {
				const lineNumber = parseInt($active, 10);

				bounds = [ lineNumber, lineNumber ];
			}
		}

		return bounds;
	},
);
