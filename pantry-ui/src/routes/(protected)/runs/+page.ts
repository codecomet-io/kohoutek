import type { PageLoad } from '../../$types';

import { Firestore } from '$lib/firestore';


export const load = (async ({ url }) => {
	const { searchParams } = url;

	const firestore = new Firestore();

	const runs = await firestore.getRuns();

	return {
		searchParams,
		runs,
	};
}) satisfies PageLoad;
