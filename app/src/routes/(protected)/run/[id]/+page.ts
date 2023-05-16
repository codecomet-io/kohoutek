import type { PageLoad } from '../../$types';

import { Firestore } from '$lib/firestore';


export const load = (async ({ params, url }) => {
	const runId = params?.id ?? '';

	const { searchParams } = url;

	if (!runId) {
		return {
			searchParams,
			error : 'Missing required parameters. Run id must be provided.',
		};
	}

	const firestore = new Firestore();

	const run = await firestore.getRun(runId);

	return {
		searchParams,
		run,
	};
}) satisfies PageLoad;
