import type { PipelinePostRunData } from '$lib/types/pipeline';


export const examplePostRunData : PipelinePostRunData = {
	id: 'n540Mrgydc',
	title: 'Pantry Build & Deploy',
	startedAt: '2023-03-02T00:53:11.606Z',
	endedAt: '2023-03-02T01:23:10.302Z',
	elapsedSeconds: 523,
	status: 'errored',
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
			parentAction: {
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
			status: 'completed',
			parentAction: {
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
			status: 'completed',
			parentAction: {
				id : 'wbgRQlCurX',
				title: 'Build Child 1',
			},
		},
		{
			id: 'P4VgTz0DHV',
			title: 'Merge',
			type: 'merge',
			startedAt: '2023-03-02T00:53:11.606Z',
			endedAt: '2023-03-02T01:23:10.302Z',
			elapsedSeconds: 5,
			status: 'errored',
			parentAction: [
				{
					id: 'G875vPPoIU',
					title: 'Build Child 2',
				},
				{
					id: 'K4VgTz0DHF',
					title: 'Deploy',
				},
			],
		},
		{
			id: 'vbgRQlCurQ',
			title: 'Build Child 3',
			type: 'custom',
			startedAt: '2023-03-02T00:53:11.606Z',
			endedAt: '2023-03-02T01:23:10.302Z',
			elapsedSeconds: 17,
			status: 'ignored',
			parentAction: {
				id: 'P4VgTz0DHV',
				title: 'Merge',
			},
		},
	],
};
