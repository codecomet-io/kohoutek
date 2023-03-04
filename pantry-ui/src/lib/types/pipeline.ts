type PipelineOrAction = {
	id: string;
	title: string;
	startedAt: string; // ISO date string
	endedAt: string; // ISO date string
	elapsedSeconds: number;
	status: Status;
};

export type Status =
	| 'success'
	| 'error'
	| 'canceled'
	;

export interface Action extends PipelineOrAction {
	// id & title of preceeding action that invoked this action
	// omitted for first action
	spawnedBy?: string;
	spawnedByTitle?: string;
}

export interface PipelinePostRunData extends PipelineOrAction {
	actions: Action[];
}
