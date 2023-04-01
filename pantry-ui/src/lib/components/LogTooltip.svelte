<script lang="ts">
	import type { GroupedLogs } from '../../../../data_importer/lib/model'

	import Prism from 'svelte-prism'
	import 'prismjs/components/prism-bash.min.js'


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

		@media (prefers-color-scheme: dark) {
			&[fill="outline"] {
				&::part(native) {
					border-color: #f4f5f8;
					color: #f4f5f8;
				}
			}
		}
	}

	.tooltip {
		bottom: calc(100% + 20px);
		right: 5px;
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
			right: 17px;
			border-top: 9px solid #ddd;
			border-left: 9px solid transparent;
			border-right: 9px solid transparent;
		}

		&::after {
			bottom: -8px;
			right: 18px;
			border-top: 8px solid #fff;
			border-left: 8px solid transparent;
			border-right: 8px solid transparent;
		}

		@media (min-width: 768px) {
			max-width: 80vw;
			right: auto;
			left: -64px;

			&::before {
				right: auto;
				left: 87px;
			}

			&::after {
				right: auto;
				left: 88px;
			}
		}

		@media (min-width: 1024px) {
			max-width: 60vw;

			&,
			&::before,
			&::after {
				left: 50%;
				transform: translateX(-50%);
			}
		}
	}

	.hover-bridge {
		position: absolute;
		bottom: 100%;
		left: 0;
		width: 100%;
		height: 12px;
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

		.value {
			:global(pre) {
				width: unset;
				padding: 0.25em 0.5em;
				background-color: #535c68;
			}
		}
	}

	.key {
		font-size: 12px;
		color: #57606a;
		text-align: right;
		white-space: nowrap;
	}

	.value {
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
		fill={ groupedLogs.exitCode === 0 ? 'outline' : 'solid' }
		color={ groupedLogs.exitCode === 0 ? 'light' : 'danger' }
		size="small"
		on:click|preventDefault
		on:keypress|preventDefault
	>
		View Info
	</ion-button>

	<aside class="tooltip">
		<div
			class="hover-bridge"
			aria-hidden="true"
		></div>

		<dl class="log-info-container">
			<dt class="key">command</dt>

			<dd class="value">
				<Prism
					language="bash"
					source={ groupedLogs.command }
				/>
			</dd>

			<dt class="key">resolved</dt>

			<dd class="value">
				<Prism
					language="bash"
					source={ groupedLogs.resolved }
				/>
			</dd>

			<dt class="key">I/O stream{ ioStreams.length === 1 ? '' : 's' }</dt>

			<dd class="value">
				<Prism
					language="bash"
					source={ ioStreams.join(', ') }
				/>
			</dd>

			<dt class="key">exit code</dt>

			<dd
				class="value exit-code-value"
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
