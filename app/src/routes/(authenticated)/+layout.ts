import type { LayoutLoad } from './$types';

import type { Pipeline, Run } from '../../../../pantry/src/lib/model';

import { Firestore } from '$lib/firestore';


export const load = (async ({ params, url }) => {
	const firestore = new Firestore();

	const { pipelineId, runId } = params;

	// let pipelines : undefined | Pipeline[];
	let pipeline : undefined | Pipeline;
	let run : undefined | Run;
	let runs : undefined | Run[];
	let recentRuns : undefined | Run[];

	if (pipelineId) {
		pipeline = await firestore.getPipeline(pipelineId) as Pipeline;

		runs = await firestore.getRunsByPipelineId(pipelineId);
	} else if (runId) {
		run = (await firestore.getRun(runId)) as Run;

		if (run?.pipeline.id) {
			pipeline = await firestore.getPipeline(run.pipeline.id) as Pipeline;

			recentRuns = await firestore.getRunsByPipelineId(run.pipeline.id, true, 3, runId);
		}
	}

	const { searchParams } = url;

	return {
		pipeline,
		run,
		runs,
		recentRuns,
		searchParams,
	};
}) satisfies LayoutLoad;
