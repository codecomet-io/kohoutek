import type { PageLoad } from './$types';

import { Firestore } from '$lib/firestore';


export const load = (async ({ fetch, url }) => {
	const { searchParams } = url;

	const pipelineId = searchParams.get('pipeline') ?? '';
	const documentId = searchParams.get('document') ?? '';

	if (!(pipelineId || documentId)) {
		return {
			searchParams,
			error : 'missing required parameters. either "pipeline" or "document" must be provided.',
		};
	}

	const pipeline = pipelineId
		? await getPipelineFromJson(pipelineId)
		: await getPipelineFromFirestore(documentId);

	return {
		searchParams,
		pipeline,
	};
}) satisfies PageLoad;

async function getPipelineFromJson(pipelineId : string) : Promise<any> {
	const response = await fetch(`/data/${ pipelineId }.json`);

	return response.json();
}

async function getPipelineFromFirestore(documentId : string) : Promise<any> {
	const firestore = new Firestore();

	return firestore.getRun(documentId);
}
