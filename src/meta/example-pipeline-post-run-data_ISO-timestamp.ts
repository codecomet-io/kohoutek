import type { PipelinePostRunData } from '$lib/types/pipeline';


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
			title: "Build Child 1",
			startedAt: "2023-03-02T00:53:11.606Z",
			endedAt: "2023-03-02T01:23:10.302Z",
			elapsedSeconds: 44,
			success: true,
			spawnedBy: "ZG5wtVoiAo",
		},
		{
			id: "G875vPPoIU",
			title: "Build Child 2",
			startedAt: "2023-03-02T00:53:11.606Z",
			endedAt: "2023-03-02T01:23:10.302Z",
			elapsedSeconds: 13,
			success: false,
			status: "error",
			spawnedBy: "ZG5wtVoiAo",
		},
		{
			id: "K4VgTz0DHF",
			title: "Deploy",
			startedAt: "2023-03-02T00:53:11.606Z",
			endedAt: "2023-03-02T01:23:10.302Z",
			elapsedSeconds: 11,
			success: false,
			status: "canceled",
			spawnedBy: "wbgRQlCurX",
		},
	],
};
