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
	started? : [ StartedFilterValue ] | [ number, number ];
}

export type StartedFilterValue =
	| 'last 24 hours'
	| 'last 3 days'
	| 'last 7 days'
	| 'last 30 days'
	| 'last 90 days'
	;

export type FiniteFilterValuesMap = {
	[ key in string ] : false | any[];
};

export type AggregatedDataMap = {
	[ key in string ] : AggregatedData;
};

export type AggregatedData = {
	subtitle          : string;
	title             : number | string;
	chartLabel?       : string;
	chartCoordinates? : Coordinate[];
};

export type Coordinate = [ number, number ];
