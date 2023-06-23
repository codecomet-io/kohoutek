import type { AnyMap } from 'briznads-helpers';

import type { AggregatedHeadlineDataOptionsMap } from '$lib/types/aggregated-headline-data';


export type ParseDisplayValueFunction = (value : any, index? : number) => string;

export type ColumnType =
	| 'number'
	| 'datetime'
	| 'string'
	;

export type Column = {
	name                           : string;
	type?                          : ColumnType;
	size?                          : number;
	hiddenHeader?                  : boolean;
	initiallyHidden?               : boolean;
	unfilterable?                  : boolean;
	unhideable?                    : boolean;
	aggregatedColumnDataDirection? : 'ascending' | 'descending';
	parseDisplayValue?     	       : ParseDisplayValueFunction;
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
	value?			 : {
		lower? : number,
		upper? : number,
	};
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

type TimeFilterMap = {
	key               : string;
	value             : TimeFilterValue;
	options           : TimeFilterNamedValue[];
	allowCustomRange? : boolean;
};

export type FiniteFilterValuesMap = {
	[ key in string ] : false | any[];
};

export interface Row extends AnyMap {
	id : string;
}

export type DefaultSort = {
	key        : string;
	direction? : 'ascending' | 'descending';
};

export type Options = {
	namespace                         : string;
	initialRows                       : Row[];
	columnMap                         : ColumnMap;
	parseRowLink                      : ParseRowLinkFunc;
	parseCellTitle                    : ParseCellTitleFunc;
	defaultTimeFilter?                : TimeFilterMap;
	aggregatedHeadlineDataOptionsMap? : AggregatedHeadlineDataOptionsMap;
	defaultSort?                      : DefaultSort;
};

export type PartialOptions = Partial<Options>;

export type ParseRowLinkFunc = (row : any) => string;

export type ParseCellTitleFunc = (key : string, value : any) => string | null;

export type AggregatedColumnData = {
	best  : number;
	worst : number;
};

export type AggregatedColumnDataMap = {
	[ key in string ] : AggregatedColumnData;
};
