<script lang="ts">
	import type { HighlightLogLineBounds } from '$lib/types/log-line';

	import { get } from 'svelte/store';

	import Prism from 'svelte-prism';
	import 'prismjs/components/prism-shell-session.min.js';

	import { getDateString } from 'briznads-helpers';

	import { gotoSearchString } from '$lib/helper';

	import { highlight, bounds } from '$lib/stores/log-line';

	import ChunkyLabel from '$lib/components/ChunkyLabel.svelte';


	export let line : string;
	export let lineNumber : number;
	export let totalLinesLength : number;
	export let isStderr : boolean;
	export let timestamp : number;

	$: lineCount = lineNumber.toString();

	function isHighlighted() : boolean {
		if (!$bounds) {
			return false;
		}

		const [ lower, upper ] = $bounds;

		return lineNumber >= lower && lineNumber <= upper;
	}

	function handleHighlightLogLineClick(event : MouseEvent) : void {
		let value : string | undefined = undefined;

		if ($highlight !== lineCount) {
			if ($highlight && event.shiftKey) {
				if (lineNumber === $bounds[0] || lineNumber === $bounds[1]) {
					return;
				} else if (lineNumber < $bounds[0]) {
					value = `${ lineNumber }-${ $bounds[1] }`;
				} else {
					value = `${ $bounds[0] }-${ lineNumber }`;
				}
			} else {
				value = lineCount;
			}
		}

		gotoSearchString('highlight_line', value);

		// wait a beat for updated search params to flow down
		setTimeout(() => selectText(event), 10);
	}

	function selectText(event : MouseEvent) : void {
		const container = (event.target as HTMLElement)?.closest('.log-container');

		if (!container) {
			return;
		}

		const startBeforeNode = container.querySelector(`a[data-line="${ $bounds[0] }"] + code + pre`);
		const endAfterNode = container.querySelector(`a[data-line="${ $bounds[1] }"] + code + pre`);

		if (!(startBeforeNode && endAfterNode)) {
			return;
		}

		const range = new Range();

		range.setStartBefore(startBeforeNode);

		range.setEndAfter(endAfterNode);

		const selection = window.getSelection();

		if (!selection) {
			return;
		}

		selection.removeAllRanges();

		selection.addRange(range);
	}

	// insure each line number is as long as the last line number for even alignment
	// to do this we compare the length of the total lines number to the current line
	// if necessary we insert zeros ("0"), which will be hidden, to balance the number
	function insertSpacingDigits() : string {
		const lineLength : number = lineCount.length;

		if (!totalLinesLength || totalLinesLength === lineLength) {
			return '';
		}

		// taking 10 to the power of the number of digits we need,
		// aka total lines length minus current line length,
		// will give us a 1 followed by the needed zeros
		// remove the 1 and return
		return (10 ** (totalLinesLength - lineLength))
			.toString()
			.replace(/[^0]/, '');
	}
</script>


<style lang="scss">
	.line-link {
		grid-column: 1;
		position: relative;
		padding: 5px 10px;
		text-decoration: none;
		text-align: right;

		&.highlight {
			&::after {
				content: '';
				position: absolute;
				top: 0;
				right: 5px;
				width: 2px;
				height: 100%;
				background-color: #f1c40f;
			}

			+ :global(code + pre) {
				background-color: rgba(115, 255, 0, 40%);
			}
		}

		&.stderr {
			:global(ion-card-subtitle) {
				--color: #eb445a;
			}
		}

		:global(ion-card-subtitle) {
			display: flex;
			pointer-events: none;
		}

		.spacing-digits,
		.visible-digits {
			pointer-events: none;
		}

		.spacing-digits {
			visibility: hidden;
		}

		.visible-digits {
			&::before {
				content: attr(data-line-number);
			}
		}

		+ :global(code + pre) {
			grid-column: 2;
		}
	}

	.stderr-badge {
		grid-column: 3;
		margin-left: 0.5em;
	}
</style>


<a
	class="line-link"
	aria-label="highlight line { lineNumber }"
	class:highlight={ isHighlighted() }
	class:stderr={ isStderr }
	href="#{ lineNumber }"
	data-line={ lineNumber }
	title={ getDateString(timestamp) }
	on:click|preventDefault={ (event) => handleHighlightLogLineClick(event) }
>
	<ChunkyLabel>
		<span
			class="spacing-digits"
			aria-hidden="true"
		>{ insertSpacingDigits() }</span>

		<span
			class="visible-digits"
			data-line-number={ lineNumber }
			aria-hidden="true"
		></span>
	</ChunkyLabel>
</a>

<Prism
	language="shell-session"
	source={ line }
/>

{#if isStderr }
	<ion-badge
		class="stderr-badge"
		color="danger"
	>StdErr</ion-badge>
{/if}
