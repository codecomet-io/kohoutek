export function parseDate(date: Date | string | number) : Date {
	return date instanceof Date
		? date
		: new Date(date);
}

export function getDateString(date: Date | string | number) : string {
	const dateObj = parseDate(date);

	return !dateObj || dateObj.toString() === 'Invalid Date'
		? ''
		: dateObj.toString();
}

export function getTimeString(date: Date | string | number) : string {
	const dateObj = parseDate(date);

	return !dateObj || dateObj.toString() === 'Invalid Date'
		? ''
		: dateObj.toLocaleTimeString();
}

// adapted from https://coolaj86.com/articles/time-ago-in-under-50-lines-of-javascript/
export function parseLapsed(ms : number) : string {
	if (ms < 250) {
		return 'a moment';
	}

	if (ms < 500) {
		return 'moments';
	}

	if (ms < 1000) {
		return ms + ' milliseconds';
	}

	let ago = Math.floor(ms / 1000);

	if (ago < 60) {
		return ago + ' seconds';
	}

	if (ago < 120) {
		return 'a minute';
	}

	let part = 0;

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