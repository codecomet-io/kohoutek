<script lang="ts">
	import { parseDate, parseLapsed, getDateString } from '$lib/helper';


	export let date : Date | string | number;

	let dateObj : Date;
	let lapsed : string;

	$: {
		dateObj = parseDate(date);

		if (dateObj && dateObj.toString() !== 'Invalid Date') {
			lapsed = parseLapsed(Date.now() - dateObj.getTime());
		}
	}
</script>


<style lang="scss"></style>


<span title={ getDateString(dateObj) }>{ !lapsed ? 'never' : lapsed + ' ago' }</span>
