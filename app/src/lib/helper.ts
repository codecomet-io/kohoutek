import { goto } from '$app/navigation';

import { smartSort, get } from 'briznads-helpers';


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

// https://stackoverflow.com/questions/60141960/typescript-key-value-relation-preserving-object-entries-type/75337277#75337277
type ValueOf<T> = T[keyof T]
type Entries<T> = [keyof T, ValueOf<T>][]

// Same as `Object.entries()` but with type inference
export function objectEntries<T extends object>(obj : T) : Entries<T> {
	return Object.entries(obj) as Entries<T>;
}

export function getEndpoints(arr : any[], nestedValuePath? : string, returnNestedValue : boolean = false) : { lower : any; upper : any } {
	const sortArr = nestedValuePath && returnNestedValue
		? arr.map(item => get(item, nestedValuePath.split('.')))
		: arr;

	const rangeArr = smartSort(sortArr, null, false, nestedValuePath && !returnNestedValue ? nestedValuePath : null);

	const upper = rangeArr.pop();
	const lower = rangeArr.shift();

	return {
		upper,
		lower,
	};
}
