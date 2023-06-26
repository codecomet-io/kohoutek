import type { LayoutLoad } from './$types';

import { redirect } from '@sveltejs/kit';

import { ga } from '$services/ga';


export const load = (async ({ data, url }) => {
	let return_to = url?.searchParams?.get('return_to');

	if (data.isAuthenticated) {
		ga.logEvent('login', {
			method : 'GitHub',
		});

		if (return_to?.startsWith('/login') || return_to?.startsWith('/logout')) {
			return_to = '/';
		}

		throw redirect(303, return_to || '/');
	}

	return {
		return_to,
	};
}) satisfies LayoutLoad;
