import type { PipelinePostRunData } from '$lib/types/pipeline';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const examplePostRunData: PipelinePostRunData = {
	id: 'n540Mrgydc',
	title: 'Pantry Build & Deploy',
	startedAt: '2023-03-02T00:53:11.606Z',
	endedAt: '2023-03-02T01:23:10.302Z',
	elapsedSeconds: 523,
	status: 'error',
	actions: [
		{
			id: 'ZG5wtVoiAo',
			title: 'Build',
			startedAt: '2023-03-02T00:53:11.606Z',
			endedAt: '2023-03-02T01:23:10.302Z',
			elapsedSeconds: 33,
			status: 'success',
		},
		{
			id: 'wbgRQlCurX',
			title: 'Build Child 1',
			startedAt: '2023-03-02T00:53:11.606Z',
			endedAt: '2023-03-02T01:23:10.302Z',
			elapsedSeconds: 44,
			status: 'success',
			spawnedBy: 'ZG5wtVoiAo',
			spawnedByTitle: 'Build',
		},
		{
			id: 'G875vPPoIU',
			title: 'Build Child 2',
			startedAt: '2023-03-02T00:53:11.606Z',
			endedAt: '2023-03-02T01:23:10.302Z',
			elapsedSeconds: 13,
			status: 'error',
			spawnedBy: 'ZG5wtVoiAo',
			spawnedByTitle: 'Build',
		},
		{
			id: 'K4VgTz0DHF',
			title: 'Deploy',
			startedAt: '2023-03-02T00:53:11.606Z',
			endedAt: '2023-03-02T01:23:10.302Z',
			elapsedSeconds: 11,
			status: 'canceled',
			spawnedBy: 'wbgRQlCurX',
			spawnedByTitle: 'Build Child 1',
		},
	],
};
