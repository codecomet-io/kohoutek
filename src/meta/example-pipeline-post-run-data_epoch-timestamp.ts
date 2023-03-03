type Action = {
	title: string;
	startedAt: number; // seconds since epoch
	endedAt: number; // seconds since epoch
	elapsedSeconds: number;
	success: boolean;
};

interface PipelinePostRunData extends Action {
	actions: Action[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const examplePostRunData: PipelinePostRunData = {
	title: 'Pantry Build & Deploy',
	startedAt: 1677718628,
	endedAt: 1677719356,
	elapsedSeconds: 523,
	success: true,
	actions: [
		{
			title: 'Build',
			startedAt: 1677718628,
			endedAt: 1677719356,
			elapsedSeconds: 33,
			success: true,
		},
		{
			title: 'Deploy',
			startedAt: 1677718628,
			endedAt: 1677719356,
			elapsedSeconds: 44,
			success: true,
		},
	],
};
