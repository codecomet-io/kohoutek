import type { Row, ParseDisplayValueFunction } from '$types/data-table';
import type { FormatValueFunction, XValueType } from '$types/line-graph';


export type AggregatedHeadlineDataParseFunc = (rows : Row[]) => Promise<PartialAggregatedHeadlineData>;

export type AggregatedHeadlineDataOptions = {
	titleLabel     : string;
	parse          : AggregatedHeadlineDataParseFunc;
	chartLabel?    : string;
	formatXValue?  : FormatValueFunction | ParseDisplayValueFunction;
	formatYValue?  : FormatValueFunction | ParseDisplayValueFunction;
	xValueType?    : XValueType;
	hideXTicks?    : boolean;
	hideYTicks?    : boolean;
	showTooltips?  : boolean;
	timeFilterKey? : string;
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
	formatXValue?     : FormatValueFunction | ParseDisplayValueFunction;
	formatYValue?     : FormatValueFunction | ParseDisplayValueFunction;
	xValueType?       : XValueType;
	hideXTicks?       : boolean;
	hideYTicks?       : boolean;
	showTooltips?     : boolean;
	timeFilterKey?    : string;
};

export type PartialAggregatedHeadlineData = Partial<AggregatedHeadlineData>;

export type AggregatedHeadlineDataMap = {
	[ key in string ] : AggregatedHeadlineData;
};
