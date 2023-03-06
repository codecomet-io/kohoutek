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
	| 'error'
	| 'canceled'
	| 'ignored'
	| 'cached'
	;

export interface Action extends PipelineOrAction {
	type: ActionType;
	// id & title of preceeding action that invoked this action
	// omitted for first action
	spawnedBy?: SpawnedBy | SpawnedBy[];
}

type ActionType =
	| CustomActionType
	| UtilityAction
	| AtomicUtilityAction
	;

type CustomActionType =
	| 'custom'
	;

type UtilityAction =
	| 'merge'
	| 'prepareFileset'
	;

type AtomicUtilityAction =
	| 'makeDirectory'
	| 'addFile'
	| 'move'
	| 'createSymbolicLink'
	| 'patch'
	;

type SpawnedBy = {
	id : string;
	title : string;
};

interface MergeAction extends Action {
	type: 'merge';
	// ids & titles of upstream actions to be merged
	spawnedBy: SpawnedBy[];
}

export interface PipelinePostRunData extends PipelineOrAction {
	actions: Array<Action | MergeAction>;
}
