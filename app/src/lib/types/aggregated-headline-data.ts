import type { Row } from '$lib/types/data-table';


export type AggregatedHeadlineDataParseFunc = (rows : Row[]) => Promise<PartialAggregatedHeadlineData>;

export type AggregatedHeadlineDataOptions = {
	titleLabel  : string;
	chartLabel? : string;
	parse       : AggregatedHeadlineDataParseFunc;
};

export type AggregatedHeadlineDataOptionsMap = {
	[ key in string ] : AggregatedHeadlineDataOptions;
};

export type Coordinate = [ number, number ];

export type AggregatedHeadlineData = {
	titleLabel        : string;
	title?            : number | string;
	chartLabel?       : string;
	chartCoordinates? : Coordinate[];
};

export type PartialAggregatedHeadlineData = Partial<AggregatedHeadlineData>;

export type AggregatedHeadlineDataMap = {
	[ key in string ] : AggregatedHeadlineData;
};
