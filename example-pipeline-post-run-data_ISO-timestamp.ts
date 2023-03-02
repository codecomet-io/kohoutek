type Action = {
	title: string;
	startedAt: string; // ISO date string
	endedAt: string; // ISO date string
	elapsedSeconds: number;
	success: boolean;
};

interface PipelinePostRunData extends Action {
	actions: Action[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const examplePostRunData : PipelinePostRunData = {
	title: 'Pantry Build & Deploy',
	startedAt: '2023-03-02T00:53:11.606Z',
	endedAt: '2023-03-02T01:23:10.302Z',
	elapsedSeconds: 523,
	success: true,
	actions: [
		{
			title: 'Build',
			startedAt: '2023-03-02T00:53:11.606Z',
			endedAt: '2023-03-02T01:23:10.302Z',
			elapsedSeconds: 33,
			success: true,
		},
		{
			title: 'Deploy',
			startedAt: '2023-03-02T00:53:11.606Z',
			endedAt: '2023-03-02T01:23:10.302Z',
			elapsedSeconds: 44,
			success: true,
		},
	],
};
