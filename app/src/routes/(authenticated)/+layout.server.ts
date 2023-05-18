import type { LayoutServerLoad } from './$types';

import * as jose from 'jose';

import { redirect } from '@sveltejs/kit';


export const load = (async ({ cookies, url }) => {
	const token = cookies.get('access_token');

	if (!token) {
		return eject(url.pathname);
	}

	let decoded;

	if (token) {
		decoded = jose.decodeJwt(token);
	}

	if (!decoded) {
		return eject(url.pathname);
	}

	console.debug(decoded);

	return {};
}) satisfies LayoutServerLoad;

function eject(pathname : string) : void {
	throw redirect(303, `/login?redirect=${ encodeURIComponent(pathname) }`);
}
