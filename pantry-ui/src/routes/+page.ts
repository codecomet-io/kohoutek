import type { PageLoad } from './$types'

export const load = (async ({ fetch, url }) => {
	const pipelineId = url.searchParams.get('pipeline')

	if (!pipelineId) {
		return {
			error : 'pipeline id was not passed',
		}
	}

	const response = await fetch(`/data/${ pipelineId }.json`)
	const pipeline = await response.json()

	return {
		pipeline,
	}
}) satisfies PageLoad
