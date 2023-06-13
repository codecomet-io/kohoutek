import type { ScaleLinear } from 'd3-scale';


export type Padding = {
	top    : number;
	right  : number;
	bottom : number;
	left   : number;
};

export type FormatValueFunction = (item : number, items? : number[]) => string;

export type XValueType =
	| undefined
	| 'date'
	;

export type ScaleFunction = ScaleLinear<number, number>;
