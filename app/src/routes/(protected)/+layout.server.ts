import type { GitHubUser } from '$lib/types/user';

import type { LayoutServerLoad } from './$types';

import { redirect } from '@sveltejs/kit';

import { Authentication } from '$lib/authentication.server';


export const load = (async ({ cookies, url }) => {
	const authentication = new Authentication(cookies, () => {
		eject(url.pathname);
	});

	const gitHubUser : GitHubUser = authentication.getGitHubUser();

	return {
		gitHubUser,
	};
}) satisfies LayoutServerLoad;

function eject(pathname : string) : void {
	throw redirect(303, `/login?return_to=${ encodeURIComponent(pathname) }`);
}
