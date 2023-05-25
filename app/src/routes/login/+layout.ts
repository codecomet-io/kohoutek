import type { LayoutLoad } from './$types';

import { redirect } from '@sveltejs/kit';


export const load = (async ({ data, url }) => {
	const return_to = url?.searchParams?.get('return_to');

	if (data.isAuthenticated) {
		throw redirect(303, return_to || '/');
	}

	return {
		return_to,
	};
}) satisfies LayoutLoad;
