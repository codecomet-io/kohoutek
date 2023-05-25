import type { LayoutServerLoad } from './$types';
import type { GitHubUser } from '$lib/verify-authentication.server';

import { redirect } from '@sveltejs/kit';

import { VerifyAuthentication } from '$lib/verify-authentication.server';


export const load = (async ({ cookies, url }) => {
	const verifyAuthentication = new VerifyAuthentication(cookies, () => {
		eject(url.pathname);
	});

	const gitHubUser : GitHubUser = verifyAuthentication.getGitHubUser();

	return {
		gitHubUser,
	};
}) satisfies LayoutServerLoad;

function eject(pathname : string) : void {
	throw redirect(303, `/login?return_to=${ encodeURIComponent(pathname) }`);
}
