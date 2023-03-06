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
			type: 'custom',
			startedAt: '2023-03-02T00:53:11.606Z',
			endedAt: '2023-03-02T01:23:10.302Z',
			elapsedSeconds: 33,
			status: 'completed',
		},
		{
			id: 'wbgRQlCurX',
			title: 'Build Child 1',
			type: 'custom',
			startedAt: '2023-03-02T00:53:11.606Z',
			endedAt: '2023-03-02T01:23:10.302Z',
			elapsedSeconds: 44,
			status: 'completed',
			spawnedBy: {
				id : 'ZG5wtVoiAo',
				title: 'Build',
			},
		},
		{
			id: 'G875vPPoIU',
			title: 'Build Child 2',
			type: 'custom',
			startedAt: '2023-03-02T00:53:11.606Z',
			endedAt: '2023-03-02T01:23:10.302Z',
			elapsedSeconds: 13,
			status: 'error',
			spawnedBy: {
				id : 'ZG5wtVoiAo',
				title: 'Build',
			},
		},
		{
			id: 'K4VgTz0DHF',
			title: 'Deploy',
			type: 'custom',
			startedAt: '2023-03-02T00:53:11.606Z',
			endedAt: '2023-03-02T01:23:10.302Z',
			elapsedSeconds: 11,
			status: 'canceled',
			spawnedBy: {
				id : 'wbgRQlCurX',
				title: 'Build Child 1',
			},
		},
	],
};
