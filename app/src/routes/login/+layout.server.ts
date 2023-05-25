import type { LayoutServerLoad } from './$types';

import { VerifyAuthentication } from '$lib/verify-authentication.server';


export const load = (async ({ cookies }) => {
	const verifyAuthentication = new VerifyAuthentication(cookies, (msg : string) => {
		console.error(msg);
	});

	const isAuthenticated : boolean = verifyAuthentication.isAuthenticated();

	return {
		isAuthenticated,
	};
}) satisfies LayoutServerLoad;
