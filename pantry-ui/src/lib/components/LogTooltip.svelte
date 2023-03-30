<script lang="ts">
	import type { GroupedLogs } from '../../../../data_importer/lib/model'

	import Prism from 'svelte-prism'
	import 'prismjs/components/prism-bash.min.js'

	import { informationCircle } from 'ionicons/icons';

	import { logsTooltipHelper } from '$lib/actions/logs-tooltip-helper'


	export let groupedLogs : GroupedLogs

	$: parseIoStreams(groupedLogs)

	let ioStreams : Array<'StdOut' | 'StdErr'> = []

	function parseIoStreams(groupedLogs : GroupedLogs) : void {
		ioStreams = []

		if (groupedLogs.logs.some((item) => !item.isStderr)) {
			ioStreams.push('StdOut')
		}

		if (groupedLogs.logs.some((item) => item.isStderr)) {
			ioStreams.push('StdErr')
		}
	}
</script>


<style lang="scss">
	%hover-focus {
		opacity: 1;
		pointer-events: auto;
		bottom: calc(100% + 10px);
	}

	%hover-focus-default-position {
		bottom: auto;
		top: calc(100% + 10px);
	}

	.tooltip-wrapper {
		position: relative;
		overflow: hidden;

		&:hover {
			.tooltip {
				@extend %hover-focus;
			}
		}

		&.default-position {
			&:hover {
				.tooltip {
					@extend %hover-focus-default-position;
				}
			}

			ion-button {
				&:focus {
					+ .tooltip {
						@extend %hover-focus-default-position;
					}
				}
			}

			.tooltip {
				bottom: auto;
				top: calc(100% + 20px);

				&::before {
					bottom: auto;
					top: -10px;
					border-top: none;
					border-bottom: 9px solid #ddd;
				}

				&::after {
					bottom: auto;
					top: -8px;
					border-top: none;
					border-bottom: 8px solid #fff;
				}
			}
		}
	}

	ion-button {
		--padding-start: 5px;
		--padding-end: 5px;

		margin: 0;

		&:focus {
			+ .tooltip {
				@extend %hover-focus;
			}
		}
	}

	.tooltip {
		bottom: calc(100% + 20px);
		left: -62px;
		z-index: 1;
		width: min-content;
		max-width: 90vw;
		padding: 8px;
		border-radius: 4px;
		background: #fff;
		border: 1px solid #ddd;
		box-shadow: 1px 1px 1px #ddd;
		font-size: 14px;
		opacity: 0;
		pointer-events: none;

		transition-duration: 250ms;
		transition-timing-function: ease-in-out;
		transition-property: opacity, top, bottom;

		&,
		&::before,
		&::after {
			position: absolute;
		}

		&::before,
		&::after {
			content: '';
		}

		&::before {
			bottom: -10px;
			left: 69px;
			border-top: 9px solid #ddd;
			border-left: 9px solid transparent;
			border-right: 9px solid transparent;
		}

		&::after {
			bottom: -8px;
			left: 70px;
			border-top: 8px solid #fff;
			border-left: 8px solid transparent;
			border-right: 8px solid transparent;
		}
	}

	.log-info-container {
		display: grid;
		grid-template-columns: min-content auto;
		align-items: center;
		margin-top: 0;
		margin-bottom: 0;
		column-gap: 10px;
		row-gap: 5px;
		overflow-x: auto;

		dd {
			:global(pre) {
				width: unset;
				padding: 0.25em 0.5em;
				background-color: #535c68;
			}
		}
	}

	dt {
		font-size: 12px;
		color: #57606a;
		text-align: right;
		white-space: nowrap;
	}

	dd {
		margin-left: 0;

		&.exit-code-value {
			:global(.token.number) {
				color: #f8f8f2;
			}

			&.non-zero-exit-code {
				:global(.token.number) {
					color: #eb445a;
				}
			}
		}
	}
</style>


<div class="tooltip-wrapper default-position">
	<ion-button
		href="#{ groupedLogs.id }"
		aria-label="view more information about this command"
		fill="clear"
		color="light"
		size="small"
		on:click|preventDefault
		on:keypress|preventDefault
		use:logsTooltipHelper
	>
		<ion-icon
			slot="icon-only"
			icon={ informationCircle }
			aria-hidden="true"
		></ion-icon>
	</ion-button>

	<aside class="tooltip">
		<dl class="log-info-container">
			<dt>command</dt>

			<dd>
				<Prism
					language="bash"
					source={ groupedLogs.command }
				/>
			</dd>

			<dt>resolved</dt>

			<dd>
				<Prism
					language="bash"
					source={ groupedLogs.resolved }
				/>
			</dd>

			<dt>I/O stream{ ioStreams.length === 1 ? '' : 's' }</dt>

			<dd>
				<Prism
					language="bash"
					source={ ioStreams.join(', ') }
				/>
			</dd>

			<dt>exit code</dt>

			<dd
				class="exit-code-value"
				class:non-zero-exit-code={ groupedLogs.exitCode !== 0 }
			>
				<Prism
					language="bash"
					source={ groupedLogs.exitCode + '' }
				/>
			</dd>
		</dl>
	</aside>
</div>
