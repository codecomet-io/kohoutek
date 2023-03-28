import { customAlphabet } from 'nanoid'

import { goto } from '$app/navigation';


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

export function parseLapsed(ms : number, abbreviate : boolean = false, precise : boolean = false, separator? : string) : string {
	if (ms == null) {
		return ''
	}

	if (!abbreviate && !precise && ms < 500) {
		const unit = 'moment'

		if (ms < 250) {
			return `a ${ unit }`
		}

		return `${ unit }s`
	}

	const unitList = [
		{
			short : 'ms',
			long : ' millisecond',
			divisor : 1000,
		},
		{
			short : 's',
			long : ' second',
			divisor : 60,
		},
		{
			short : 'm',
			long : ' minute',
			divisor : 60,
		},
		{
			short : 'h',
			long : ' hour',
			divisor : 24,
		},
		{
			short : 'd',
			long : ' day',
			divisor : 7,
		},
		{
			short : 'w',
			long : ' week',
			divisor : 4,
		},
		{
			short : 'mo',
			long : ' month',
			divisor : 12,
		},
		{
			short : 'yr',
			long : ' year',
		},
	]

	const parseCount = (count : number, unitFirstLetter : string) : string =>
		!abbreviate && !precise && count === 1
			? `a${ unitFirstLetter === 'h' ? 'n' : '' }`
			: count.toString()

	const parsePlural = (count : number) : string =>
		!abbreviate && count !== 1
			? 's'
			: ''

	const timeList : string[] = []

	let dividend : number = ms

	for (const i in unitList) {
		if (dividend === 0) {
			break
		}

		const unit = unitList[i]

		let remainder : number = 0

		if (unit.divisor) {
			remainder = dividend % unit.divisor

			dividend = Math.floor(dividend / unit.divisor)

			if (remainder === 0) {
				continue
			} else if (!precise && dividend === 0 && remainder / unit.divisor >= 0.9) {
				dividend = 1

				continue
			}
		}

		const unitName : string = unit[ abbreviate ? 'short' : 'long' ]

		const timeStr = parseCount(remainder, unitName.charAt(0)) + unitName + parsePlural(remainder)

		timeList.unshift(timeStr)
	}

	if (separator == null) {
		separator = abbreviate
			? ' '
			: ', '
	}

	return precise
		? timeList.join(separator)
		: timeList.shift() ?? ''
}

export function isPopulated(list : any) : boolean {
	return Array.isArray(list) && list.length > 0
}

export function createId(useCase? : 'html', length : number = 6) : string {
	//  we use a character set w/out lookalike characters
	// e.g. 1, l, I, 0, O, o, u, v, 5, S, s, 2, Z
	// https://github.com/CyberAP/nanoid-dictionary#nolookalikes
	const characterSet : string = '346789ABCDEFGHJKLMNPQRTUVWXYabcdefghijkmnpqrtwxyz'

	const nanoid = customAlphabet(characterSet, length)

	const id : string = nanoid()

	// if the use of this function is to create html ids, insure first character is a letter
	return useCase === 'html' && /^[^A-Za-z]/.test(id)
		? createId(useCase, length)
		: id
}

export function getUrlSearchParams(searchString? : string) : URLSearchParams {
	return new URLSearchParams(searchString ?? window.location.search)
}

export function updateSearchString(key : string, value? : string) : string {
	const urlSearchParams = getUrlSearchParams()

	if (value) {
		urlSearchParams.set(key, value)
	} else {
		urlSearchParams.delete(key)
	}

	return urlSearchParams.toString()
}

export function gotoSearchString(key : string, value? : string) : Promise<void> {
	return goto(`${ window.location.pathname }?${ updateSearchString(key, value) }`)
}
