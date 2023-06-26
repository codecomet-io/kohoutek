import type { LayoutServerLoad } from './$types';

import { Authentication } from '$services/authentication.server';


export const load = (async ({ cookies }) => {
	const authentication = new Authentication(cookies);

	const isAuthenticated : boolean = authentication.isAuthenticated();

	return {
		isAuthenticated,
	};
}) satisfies LayoutServerLoad;
