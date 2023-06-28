import type { Row, ParseDisplayValueFunction } from '$types/data-table';
import type { FormatValueFunction, XValueType } from '$types/line-graph';


export type AggregatedHeadlineDataParseFunc = (rows : Row[]) => Promise<PartialAggregatedHeadlineData>;

export type AggregatedHeadlineDataOptions = {
	titleLabel          : string;
	parse               : AggregatedHeadlineDataParseFunc;
	chartLabel?         : string;
	formatXValue?       : FormatValueFunction | ParseDisplayValueFunction;
	formatYValue?       : FormatValueFunction | ParseDisplayValueFunction;
	xValueType?         : XValueType;
	hideXTicks?         : boolean;
	hideYTicks?         : boolean;
	showTooltips?       : boolean;
	timeFilterKey?      : string;
	trendDataDirection? : TrendDirectionValue;
};

export type AggregatedHeadlineDataOptionsMap = {
	[ key in string ] : AggregatedHeadlineDataOptions;
};

export type Coordinate = [ number, number ];

export interface AggregatedHeadlineData extends Omit<AggregatedHeadlineDataOptions, 'parse'> {
	aggregatedValue?  : number;
	title?            : string;
	chartCoordinates? : Coordinate[];
}

export type AggregatedHeadlineDataMap = {
	[ key in string ] : AggregatedHeadlineData;
};

export type PartialAggregatedHeadlineData = Partial<AggregatedHeadlineData>;

export type TrendDirectionValue =
	| 'ascending'
	| 'descending'
	| 'neutral'
	;

export type TrendData = {
	currentValue   : number;
	direction      : TrendDirectionValue;
	previousValue? : number;
	changePercent? : number;
	previousTitle? : string;
};

export type TrendDataMap = {
	[ key in string ] : TrendData;
};
