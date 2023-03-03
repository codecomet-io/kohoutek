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

interface Action extends PipelineOrAction {
	spawnedBy? : string; // id of preceeding action that invoked this action; omitted for first action
}

interface PipelinePostRunData extends PipelineOrAction {
	actions: Action[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const examplePostRunData: PipelinePostRunData = {
	id: "n540Mrgydc",
	title: "Pantry Build & Deploy",
	startedAt: "2023-03-02T00:53:11.606Z",
	endedAt: "2023-03-02T01:23:10.302Z",
	elapsedSeconds: 523,
	success: false,
	status: "error",
	actions: [
		{
			id: "ZG5wtVoiAo",
			title: "Build",
			startedAt: "2023-03-02T00:53:11.606Z",
			endedAt: "2023-03-02T01:23:10.302Z",
			elapsedSeconds: 33,
			success: true,
		},
		{
			id: "wbgRQlCurX",
			title: "Deploy",
			startedAt: "2023-03-02T00:53:11.606Z",
			endedAt: "2023-03-02T01:23:10.302Z",
			elapsedSeconds: 44,
			success: true,
			spawnedBy: "ZG5wtVoiAo",
		},
		{
			id: "G875vPPoIU",
			title: "Deploy",
			startedAt: "2023-03-02T00:53:11.606Z",
			endedAt: "2023-03-02T01:23:10.302Z",
			elapsedSeconds: 44,
			success: false,
			status: "error",
			spawnedBy: "ZG5wtVoiAo",
		},
		{
			id: "K4VgTz0DHF",
			title: "Deploy",
			startedAt: "2023-03-02T00:53:11.606Z",
			endedAt: "2023-03-02T01:23:10.302Z",
			elapsedSeconds: 44,
			success: false,
			status: "canceled",
			spawnedBy: "wbgRQlCurX",
		},
	],
};
