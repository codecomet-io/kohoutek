type PipelineOrAction = {
	id: string;
	title: string;
	startedAt: string; // ISO date string
	endedAt: string; // ISO date string
	elapsedSeconds: number;
	status: Status;
};

export type Status =
	| 'completed'
	| 'errored'
	| 'canceled'
	| 'ignored'
	| 'cached'
	;

interface SingleParentAction extends PipelineOrAction {
	type: UtilityAction | 'custom';
	// id & title of preceeding action that invoked this action
	// omitted for first action
	parentAction?: ParentAction;
}

interface MergeAction extends PipelineOrAction {
	type: 'merge';
	// ids & titles of upstream actions to be merged
	parentAction: ParentAction[];
}

export type Action =
	| SingleParentAction
	| MergeAction
	;

type UtilityAction =
	| 'prepareFileset'
	| 'makeDirectory'
	| 'addFile'
	| 'move'
	| 'createSymbolicLink'
	| 'patch'
	;

type ParentAction = {
	id : string;
	title : string;
};

export interface PipelinePostRunData extends PipelineOrAction {
	actions: Action[];
}
