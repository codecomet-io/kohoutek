import { goto } from '$app/navigation';

export function getUrlSearchParams(searchString? : string) : URLSearchParams {
	return new URLSearchParams(searchString ?? window.location.search);
}

type SearchParamsMap = {
	[ key : string ] : string | undefined
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
