import type { LayoutLoad } from './$types';

import { Firestore } from '$lib/firestore';


export const load = (async () => {
	const firestore = new Firestore();

	const recentRuns = await firestore.getRuns(true, 3);

	return {
		recentRuns,
	};
}) satisfies LayoutLoad;
