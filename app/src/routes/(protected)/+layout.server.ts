import type { LayoutServerLoad } from './$types';
import type { GitHubUser } from '$lib/verify-authentication.server';

import { Octokit } from 'octokit';

import { redirect } from '@sveltejs/kit';

import { VerifyAuthentication } from '$lib/verify-authentication.server';


export const load = (async ({ params, cookies, url }) => {
	const { org, pipelineId, runId } = params;

	const verifyAuthentication = new VerifyAuthentication(cookies, (msg : string) => {
		console.error(msg);

		eject(url.pathname);
	});

	const gitHubUser : GitHubUser = verifyAuthentication.getGitHubUser();

	gitHubUser.repos = await getRepos(verifyAuthentication.getPersonalAccessToken(), org as string);

	return {
		org,
		pipelineId,
		runId,
		gitHubUser,
	};
}) satisfies LayoutServerLoad;

function eject(pathname : string) : void {
	throw redirect(303, `/login?return_to=${ encodeURIComponent(pathname) }`);
}

async function getRepos(
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

	let repos = response?.data
		.map((repo : any) => repo.full_name);

	if (response?.data?.length === per_page) {
		repos = [
			...repos,
			...(await getRepos(personalAccessToken, org, per_page, page + 1, octokit)),
		];
	}

	return repos;
}