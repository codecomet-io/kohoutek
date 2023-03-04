export function parseDate(date : string | Date) : string {
	const dateObj = typeof date === 'string'
		? new Date(date)
		: date;

	return dateObj.toString() === 'Invalid Date'
		? ''
		: dateObj.toString();
}

export function parseTime(date : string | Date) : string {
	const dateObj = typeof date === 'string'
		? new Date(date)
		: date;

	return dateObj.toString() === 'Invalid Date'
		? ''
		: dateObj.toLocaleTimeString();
}

// adapted from https://coolaj86.com/articles/time-ago-in-under-50-lines-of-javascript/
export function parseLapsed(ms : number) : string {
	let ago = Math.floor(ms / 1000);
	let part = 0;

	if (ago < 2) {
		return 'a moment';
	}

	if (ago < 5) {
		return 'moments';
	}

	if (ago < 60) {
		return ago + ' seconds';
	}

	if (ago < 120) {
		return 'a minute';
	}

	if (ago < 3600) {
		while (ago >= 60) {
			ago -= 60;
			part += 1;
		}

		return part + ' minutes';
	}

	if (ago < 7200) {
		return 'an hour';
	}

	if (ago < 86400) {
		while (ago >= 3600) {
			ago -= 3600;
			part += 1;
		}

		return part + ' hours';
	}

	if (ago < 172800) {
		return 'a day';
	}

	if (ago < 604800) {
		while (ago >= 172800) {
			ago -= 172800;
			part += 1;
		}

		return part + ' days';
	}

	if (ago < 1209600) {
		return 'a week';
	}

	if (ago < 2592000) {
		while (ago >= 604800) {
			ago -= 604800;
			part += 1;
		}

		return part + ' weeks';
	}

	if (ago < 5184000) {
		return 'a month';
	}

	if (ago < 31536000) {
		while (ago >= 2592000) {
			ago -= 2592000;
			part += 1;
		}

		return part + ' months';
	}

	if (ago < 1419120000) { // 45 years, approximately the epoch
		return 'more than year';
	}

	return '';
}