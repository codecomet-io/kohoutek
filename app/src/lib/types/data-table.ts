import type { AnyMap } from 'briznads-helpers';

import type { AggregatedHeadlineDataOptionsMap } from '$lib/types/aggregated-headline-data';


export type Column = {
	name             : string;
	size?            : number;
	hiddenHeader?    : boolean;
	initiallyHidden? : boolean;
	unfilterable?    : boolean;
	unhideable?      : boolean;
};

export type ColumnMap = {
	[ key in string ] : Column;
};

export type ActiveSort = {
	key       : string;
	direction : 'ascending' | 'descending';
};

export type AddFilterInfo = {
	key          : string;
	finiteValues : false | any[];
	value?			 : any[];
};

type GenericFilterMap = {
	[ key in string ]? : any[];
};

export interface FilterMap extends GenericFilterMap {
	started? : TimeFilterValue;
}

export type TimeFilterNamedValue =
	| 'last 24 hours'
	| 'last 3 days'
	| 'last 7 days'
	| 'last 30 days'
	| 'last 90 days'
	| 'last 365 days'
	;

type TimeFilterValue = [ TimeFilterNamedValue ] | [ number, number ];

export type FiniteFilterValuesMap = {
	[ key in string ] : false | any[];
};

export interface Row extends AnyMap {
	id : string;
}

export type Options = {
	namespace                         : string;
	initialRows                       : Row[];
	columnMap                         : ColumnMap;
	parseRowLink                      : ParseRowLinkFunc;
	parseCellTitle                    : ParseCellTitleFunc;
	defaultTimeFilter?                : TimeFilterValue | false;
	aggregatedHeadlineDataOptionsMap? : AggregatedHeadlineDataOptionsMap;
};

export type PartialOptions = Partial<Options>;

export type ParseRowLinkFunc = (row : any) => string;

export type ParseCellTitleFunc = (key : string, value : any) => string;
