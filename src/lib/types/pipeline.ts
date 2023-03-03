type PipelineOrAction = {
	id: string;
	title: string;
	startedAt: string; // ISO date string
	endedAt: string; // ISO date string
	elapsedSeconds: number;
	success: boolean;
	status?: Status;
};

type Status =
	| 'error'
	| 'canceled'
	;

export interface Action extends PipelineOrAction {
	spawnedBy?: string; // id of preceeding action that invoked this action; omitted for first action
}

export interface PipelinePostRunData extends PipelineOrAction {
	actions: Action[];
}
