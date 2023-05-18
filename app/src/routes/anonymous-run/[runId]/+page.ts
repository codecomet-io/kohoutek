import type { PageLoad } from './$types';


export const load = (async ({ params, url, fetch }) => {
	const { runId } = params;

	const { searchParams } = url;

	if (!runId) {
		return {
			searchParams,
			error : 'Missing required parameters. Run id must be provided.',
		};
	}

	const response = await fetch(`/data/${ runId }.json`);

	const run = await response.json();

	return {
		searchParams,
		run,
	};
}) satisfies PageLoad;
