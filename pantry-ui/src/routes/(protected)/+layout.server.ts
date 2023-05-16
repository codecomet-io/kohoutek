import { redirect } from '@sveltejs/kit';

import type { LayoutServerLoad } from './$types';

export const load = (async ({ cookies, url }) => {
    console.debug('/(protected)/+layout.server');

    // if (!cookies.get('logged_in')) {
	// 	throw redirect(303, `/login?redirectTo=${url.pathname}`);
	// }

    return {};
}) satisfies LayoutServerLoad;
