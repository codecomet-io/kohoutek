import type { LayoutLoad } from './$types';
import type { Pipeline, Run } from '../../../../pantry/src/lib/model';

import { Octokit } from 'octokit';
import { error } from '@sveltejs/kit';

import { browser } from '$app/environment';
import { Firestore } from '$lib/firestore';


export const load = (async ({ params, data, url }) => {
	const { org, pipelineId, runId } = params;

	data.gitHubUser.repos = await getRepos(data.gitHubUser.personalAccessToken, org as string);

	const firestore = new Firestore();

	let pipelines : undefined | Pipeline[];
	let pipeline : undefined | Pipeline;
	let run : undefined | Run;
	let runs : undefined | Run[];
	let recentRuns : undefined | Run[];

	if (pipelineId) {
		pipeline = await getPipelineForUser(firestore, pipelineId, data.gitHubUser.repos);

		if (runId) {
			run = await getRun(firestore, pipelineId, runId);

			recentRuns = await firestore.getRunsByPipelineId(pipelineId, true, 3);
		} else {
			runs = await firestore.getRunsByPipelineId(pipelineId);
		}
	} else if (org) {
		// if pipelineId and runId are both undefined, then we're on the all pipelines page
		pipelines = await getPipelinesForUser(firestore, org, data.gitHubUser.repos);
	}

	const { searchParams } = url;

	return {
		...data,
		org,
		pipelineId,
		runId,
		pipelines,
		pipeline,
		run,
		runs,
		recentRuns,
		searchParams,
	};
}) satisfies LayoutLoad;

async function getRepos(personalAccessToken : string, org : string) : Promise<string[]> {
	const localStorageKey = 'gitHubUser.repos';

	if (browser) {
		const storedString = window.localStorage.getItem(localStorageKey);

		if (storedString) {
			return JSON.parse(storedString);
		}
	}

	const repos = await getReposFromGitHub(personalAccessToken, org);

	if (browser) {
		window.localStorage.setItem(localStorageKey, JSON.stringify(repos));
	}

	return repos;
}

async function getReposFromGitHub(
	personalAccessToken : string,
	org                 : string,
	per_page            : number = 100,
	page                : number = 1,
	octokit?            : Octokit,
) : Promise<string[]> {
	if (!octokit) {
		octokit = new Octokit({ auth : personalAccessToken });
	}

	const params = {
		per_page,
		page,
	};

	const paramsString = Object.entries(params)
		.map((param : [ string, number ]) => param.join('='))
		.join('&');

	let response;

	try {
		response = await octokit.request(`GET /orgs/${ org }/repos?${ paramsString }`, {
			headers : {
				'X-GitHub-Api-Version' : '2022-11-28',
			},
		});
	} catch (error : any) {
		if (error?.response) {
			console.error(`Error! Status: ${ error.response.status }. Message: ${ error.response.data.message }`);
		}

		console.error(error);
	}

	let repos = (response?.data ?? [])
		.map((repo : any) => repo.full_name);

	if (response?.data?.length === per_page) {
		repos = [
			...repos,
			...(await getReposFromGitHub(personalAccessToken, org, per_page, page + 1, octokit)),
		];
	}

	return repos;
}

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

async function getRun(firestore : Firestore, pipelineId : string, runId : string) : Promise<undefined | Run> {
	const run = (await firestore.getRun(runId)) as Run;

	return run.pipeline.id === pipelineId
		? run
		: undefined;
}
