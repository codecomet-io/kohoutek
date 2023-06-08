import { goto } from '$app/navigation';

import { smartSort, get, deepCopy } from 'briznads-helpers';


export function getUrlSearchParams(searchString? : string) : URLSearchParams {
	return new URLSearchParams(searchString ?? window.location.search);
}

type SearchParamsMap = {
	[ key in string ] : string | undefined;
}

export function updateSearchString(keyOrObject : string | SearchParamsMap, optionalValue? : string) : string {
	const urlSearchParams = getUrlSearchParams();

	if (typeof keyOrObject === 'string') {
		updateUrlSearchParams(urlSearchParams, keyOrObject, optionalValue);
	} else if (typeof keyOrObject === 'object') {
		for (const [ key, value ] of Object.entries(keyOrObject)) {
			updateUrlSearchParams(urlSearchParams, key, value);
		}
	}

	return urlSearchParams.toString();
}

function updateUrlSearchParams(urlSearchParams : URLSearchParams, key : string, value? : string) : URLSearchParams {
	if (value) {
		urlSearchParams.set(key, value);
	} else {
		urlSearchParams.delete(key);
	}

	return urlSearchParams;
}

export function gotoSearchString(keyOrObject : string | SearchParamsMap, optionalValue? : string) : Promise<void> {
	return goto(`${ window.location.pathname }?${ updateSearchString(keyOrObject, optionalValue) }`);
}

export function handleEnterKey(event : any, callback : () => void) : void {
	if (event.key === 'Enter') {
		callback();
	}
}

export const HEK = handleEnterKey;

export function getEndpoints(arr : any[], nestedValuePath? : string, returnNestedValue : boolean = false, includeMedian : boolean = false) : { lower : any, median? : any, upper : any } {
	const sortArr = nestedValuePath && returnNestedValue
		? arr.map(item => get(item, nestedValuePath.split('.')))
		: arr;

	const rangeArr = smartSort(sortArr, undefined, false, nestedValuePath && !returnNestedValue ? nestedValuePath : undefined);

	let median : any;

	if (includeMedian) {
		median = deepCopy(rangeArr[ Math.round((rangeArr.length - 1) / 2) ]);
	}

	const lower = deepCopy(rangeArr[ 0 ]);
	const upper = deepCopy(rangeArr[ rangeArr.length - 1 ]);

	return includeMedian
		? {
			upper,
			median,
			lower,
		} : {
			upper,
			lower,
		};
}
