import type { LayoutLoad } from './$types';

import type { Run } from '../../../../pantry/src/lib/model';

import { Firestore } from '$lib/firestore';


export const load = (async ({ params, url }) => {
	const firestore = new Firestore();

	const { pipelineId, runId } = params;

	let run : undefined | Run;
	let runs : undefined | Run[];
	let recentRuns : undefined | Run[];

	if (pipelineId) {
		runs = await firestore.getRunsByPipelineId(pipelineId);
	} else if (runId) {
		run = (await firestore.getRun(runId)) as Run;

		if (run?.pipeline.id) {
			recentRuns = await firestore.getRunsByPipelineId(run.pipeline.id, true, 3, runId);
		}
	}

	const { searchParams } = url;

	return {
		run,
		runs,
		recentRuns,
		searchParams,
	};
}) satisfies LayoutLoad;
