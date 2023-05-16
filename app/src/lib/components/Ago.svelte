<script lang="ts">
	import { parseDate, lapsed, getDateString } from 'briznads-helpers';


	export let date : Date | string | number;

	let dateObj : Date;
	let parseLapsed : string;

	$: {
		dateObj = parseDate(date);

		if (dateObj && dateObj.toString() !== 'Invalid Date') {
			parseLapsed = lapsed(Date.now() - dateObj.getTime());
		}
	}
</script>


<style lang="scss"></style>


<span title={ getDateString(dateObj) }>{ parseLapsed ? parseLapsed + ' ago' : 'never' }</span>
