<script lang="ts">
	import type { PageData } from './$types';


	export let data : PageData;
</script>


<style lang="scss"></style>


<ion-content
	class="ion-padding"
	fullscreen={ true }
>
	<ion-list>
		{#each data.pipelines ?? [] as pipeline }
			<ion-item href="/pipeline/{ pipeline.id }/runs">
				<ion-label>{ pipeline.name }</ion-label>
			</ion-item>
		{/each}
	</ion-list>
</ion-content>
