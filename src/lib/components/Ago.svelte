<script lang="ts">
	import { parseLapsed, parseDate } from '$lib/helper';


	export let date : string | Date;

	let dateObj : Date;
	let lapsed : string;

	$: {
		dateObj = typeof date === 'string'
			? new Date(date)
			: date;

		lapsed = parseLapsed(Date.now() - dateObj.getTime());
	}
</script>


<style lang="scss"></style>


<span title={ parseDate(dateObj) }>{ !lapsed ? 'never' : lapsed + ' ago' }</span>
