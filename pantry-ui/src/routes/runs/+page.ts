import type { PageLoad } from '../../$types';

import { Firestore } from '$lib/firestore';


export const load = (async ({ params, url }) => {
	const documentId = params?.id ?? '';

	const { searchParams } = url;

	if (!documentId) {
		return {
			searchParams,
			error : 'Missing required parameters. Document id must be provided.',
		};
	}

	const firestore = new Firestore();

	const pipeline = await firestore.getRuns();

	return {
		searchParams,
		pipeline,
	};
}) satisfies PageLoad;
