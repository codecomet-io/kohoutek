<script
	lang="ts"
	context="module"
>
	import { onMount } from 'svelte';

	/* Import all components - or do partial loading - see below */
	// import 'ionic-svelte/components/all'

	/*
		This part - import 'ionic-svelte/components/all'; -  loads all components at once.

		This adds at least >800kb (uncompressed) to your bundle - 80 components (so do your math!!)

		You can also choose to import each component you want to use separately and leave out others.

		It is recommended to do this in this file, as you only need to do such once. But you are free
		to do this elsewhere if you like to code-split differently.

		Example: if you replace the line import 'ionic-svelte/components/all'; with the imports below, you will see the resulting bundle being much smaller
	*/

	import 'ionic-svelte/components/ion-accordion';
	import 'ionic-svelte/components/ion-accordion-group';
	import 'ionic-svelte/components/ion-alert';
	import 'ionic-svelte/components/ion-app';
	import 'ionic-svelte/components/ion-avatar';
	import 'ionic-svelte/components/ion-badge';
	import 'ionic-svelte/components/ion-breadcrumb';
	import 'ionic-svelte/components/ion-breadcrumbs';
	import 'ionic-svelte/components/ion-button';
	import 'ionic-svelte/components/ion-buttons';
	import 'ionic-svelte/components/ion-card';
	import 'ionic-svelte/components/ion-card-content';
	import 'ionic-svelte/components/ion-card-header';
	import 'ionic-svelte/components/ion-card-subtitle';
	import 'ionic-svelte/components/ion-card-title';
	import 'ionic-svelte/components/ion-chip';
	import 'ionic-svelte/components/ion-col';
	import 'ionic-svelte/components/ion-content';
	import 'ionic-svelte/components/ion-datetime';
	import 'ionic-svelte/components/ion-datetime-button';
	import 'ionic-svelte/components/ion-footer';
	import 'ionic-svelte/components/ion-grid';
	import 'ionic-svelte/components/ion-header';
	import 'ionic-svelte/components/ion-input';
	import 'ionic-svelte/components/ion-item';
	import 'ionic-svelte/components/ion-item-divider';
	import 'ionic-svelte/components/ion-item-group';
	import 'ionic-svelte/components/ion-label';
	import 'ionic-svelte/components/ion-list';
	import 'ionic-svelte/components/ion-list-header';
	import 'ionic-svelte/components/ion-menu';
	import 'ionic-svelte/components/ion-menu-button';
	import 'ionic-svelte/components/ion-menu-toggle';
	import 'ionic-svelte/components/ion-modal';
	import 'ionic-svelte/components/ion-popover';
	import 'ionic-svelte/components/ion-radio';
	import 'ionic-svelte/components/ion-range';
	import 'ionic-svelte/components/ion-radio-group';
	import 'ionic-svelte/components/ion-row';
	import 'ionic-svelte/components/ion-searchbar';
	import 'ionic-svelte/components/ion-select';
	import 'ionic-svelte/components/ion-select-option';
	import 'ionic-svelte/components/ion-split-pane';
	import 'ionic-svelte/components/ion-title';
	import 'ionic-svelte/components/ion-toolbar';

	/*
		Click the ionic-svelte-components-all-import above to go to the full list of possible imports.

		Please don't forget to import ion-app in this file when you decide to code-split:

	    import 'ionic-svelte/components/ion-app';

		You can report issues here - https://github.com/Tommertom/svelte-ionic-npm/issues
		Want to know what is happening more - follow me on Twitter - https://twitter.com/Tommertomm
		Discord channel on Ionic server - https://discordapp.com/channels/520266681499779082/1049388501629681675
	*/

	import { setupIonicBase } from 'ionic-svelte';

	import { ga } from '$services/ga';

	import { spatialMode } from '$stores/ui-toggles';

	/* Theme variables */
	import '../theme/variables.css';

	/* Call Ionic's setup routine */
	setupIonicBase({
		mode                      : 'ios',
		innerHTMLTemplatesEnabled : true,
	});
</script>


<script lang="ts">
	function initGoogleAnalytics() {
		ga.init();
	}

	onMount(initGoogleAnalytics);
</script>


<style lang="scss">
	:global(.visually-hidden) {
		clip: rect(0 0 0 0);
		clip-path: inset(50%);
		height: 1px;
		overflow: hidden;
		position: absolute;
		white-space: nowrap;
		width: 1px;
	}

	:global(.mobile-only) {
		@media (min-width: 992px) {
			display: none;
		}
	}
</style>


<ion-app style="--drop-shadow: { $spatialMode ? 'rgba(0, 0, 0, 0.12) 0px 4px 16px' : 'none' };">
	<slot />
</ion-app>
