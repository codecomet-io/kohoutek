import type { RequestHandler } from './$types';

import * as jose from 'jose';

import { Octokit } from 'octokit';


export const GET = (async ({ cookies, url }) => {
	let status : number = 418;

	const token = cookies.get('access_token');

	if (!token) {
		return parseResponse(status);
	}

	let decoded;

	if (token) {
		decoded = jose.decodeJwt(token);
	}

	if (!decoded) {
		return parseResponse(status);
	}

	const personalAccessToken = <string>decoded.forwarded_token;

  const repo = url?.searchParams?.get('repo');

	const octokit = new Octokit({ auth : personalAccessToken });

	try {
		const getRepo = await octokit.request(`GET /repos/${ repo }`, {
			headers : {
				'X-GitHub-Api-Version' : '2022-11-28',
			},
		});

		status = getRepo.status;
	} catch (error : any) {
		if (error?.response) {
			status = error.response.status;
		} else {
			console.error(error);
		}
	}

	return parseResponse(status);
}) satisfies RequestHandler;

function parseResponse(status : number) : Response {
	const message = {
		status,
		allowed : status === 200,
	};

	return new Response(JSON.stringify(message));
}
