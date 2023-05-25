import type { PageLoad } from './$types';


export const load = (async ({ url, fetch }) => {
	const authServer = url.origin.replace(/\/[a-z]+\./i, '/auth.');
	const logoutUrl = `${ authServer }/logout`;

	let loggedOut : boolean = false;

	try {
		await fetch(logoutUrl, {
			mode        : 'no-cors',
			cache       : 'no-cache',
			credentials : 'include',
			redirect    : 'follow',
			headers     : {
				'Content-Type' : 'application/json',
			},
		});

		loggedOut = true;
	} catch (error : any) {
		console.error(error);
	}

	return {
		loggedOut,
	};
}) satisfies PageLoad;
