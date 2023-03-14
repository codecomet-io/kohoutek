<script lang="ts">
	export let allcaps : boolean = true
	export let title : undefined | string = undefined
</script>


<style lang="scss">
	ion-card-subtitle {
		margin-bottom: 0;

		&.mixed-case {
			text-transform: none;
		}
	}
</style>


<ion-card-subtitle
	title={ title }
	class:mixed-case={ !allcaps }
>
	<slot></slot>
</ion-card-subtitle>
