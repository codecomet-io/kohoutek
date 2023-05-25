import type { LayoutLoad } from './$types';

import { error } from '@sveltejs/kit';

import type { Pipeline, Run } from '../../../../pantry/src/lib/model';

import { Firestore } from '$lib/firestore';


export const load = (async ({ data, url }) => {
	const firestore = new Firestore();

	const userRepos = data?.gitHubUser?.repos;

	// let pipelines : undefined | Pipeline[];
	let pipelines : undefined | Pipeline[];
	let pipeline : undefined | Pipeline;
	let run : undefined | Run;
	let runs : undefined | Run[];
	let recentRuns : undefined | Run[];

	if (data.pipelineId) {
		pipeline = await getPipelineForUser(firestore, data.pipelineId, userRepos);

		runs = await firestore.getRunsByPipelineId(data.pipelineId);
	} else if (data.runId) {
		run = (await firestore.getRun(data.runId)) as Run;

		const pipelineId = run?.pipeline?.id;

		pipeline = await getPipelineForUser(firestore, pipelineId, userRepos);

		recentRuns = await firestore.getRunsByPipelineId(pipelineId, true, 3, data.runId);
	} else if (data.org) {
		// if pipelineId and runId are both undefined, then we're on the all pipelines page
		pipelines = await getPipelinesForUser(firestore, data.org, userRepos);
	}

	const { searchParams } = url;

	return {
		...data,
		pipelines,
		pipeline,
		run,
		runs,
		recentRuns,
		searchParams,
	};
}) satisfies LayoutLoad;

async function getPipelineForUser(firestore : Firestore, pipelineId : string, repos? : string[]) : Promise<Pipeline> {
	const pipeline = (await firestore.getPipeline(pipelineId)) as Pipeline;

	await confirmAuthorization(pipeline, repos);

	return pipeline;
}

async function confirmAuthorization(pipeline? : Pipeline, repos : string[] = []) : Promise<void> {
	if (!pipeline) {
		throw error(404, {
			message : 'pipeline not found',
		});
	}

	if (repos.includes(pipeline.repo)) {
		return;
	}

	throw error(403, {
		message : 'forbidden',
	});
}

async function getPipelinesForUser(firestore : Firestore, org : string, repos : string[] = []) : Promise<Pipeline[]> {
	const pipelines = await firestore.getPipelinesByOrg(org);

	const authorizedPipelines = (pipelines ?? [])
		.filter(pipeline => repos.includes(pipeline.repo));

	return authorizedPipelines;
}
