<script lang="ts">
	export let allcaps : boolean = true;
</script>


<style lang="scss">
	ion-card-subtitle {
		margin-bottom: 0;

		&.mixed-case {
			text-transform: none;
		}
	}
</style>


<ion-card-subtitle class={ allcaps ? '' : 'mixed-case' }>
	<slot></slot>
</ion-card-subtitle>
