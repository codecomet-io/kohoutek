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

export type FilterMap = {
	[ key in string ] : any[];
};

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
