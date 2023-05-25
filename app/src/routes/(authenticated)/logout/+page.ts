import type { PageLoad } from './$types';

import { redirect } from '@sveltejs/kit';


export const load = (async ({ url, fetch }) => {
	const authServer = url.origin.replace(/\/[a-z]+\./i, '/auth.');

	const logoutUrl = `${ authServer }/logout`;

	try {
		await fetch(logoutUrl, {
			mode : 'no-cors',
			cache : 'no-cache',
			credentials : 'include',
			headers : {
				'Content-Type' : 'application/json',
			},
			redirect : 'follow',
		});

		throw redirect(303, '/login');
	} catch (error : any) {
		console.error(error);
	}

	return {};
}) satisfies PageLoad;
