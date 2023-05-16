import type { PageLoad } from '../../$types';


export const load = (async ({ params, url, fetch }) => {
	const pipelineId = params?.id ?? '';

	const { searchParams } = url;

	if (!pipelineId) {
		return {
			searchParams,
			error : 'Missing required parameters. Run id must be provided.',
		};
	}

	const response = await fetch(`/data/${ pipelineId }.json`);

	const pipeline = await response.json();

	return {
		searchParams,
		pipeline,
	};
}) satisfies PageLoad;
