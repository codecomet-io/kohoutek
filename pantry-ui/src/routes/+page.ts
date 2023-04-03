import type { PageLoad } from './$types'

export const load = (async ({ fetch, url }) => {
	const { searchParams } = url

	const pipelineId = searchParams.get('pipeline')

	if (!pipelineId) {
		return {
			searchParams,
			error : 'pipeline id was not passed',
		}
	}

	const response = await fetch(`/data/${ pipelineId }.json`)

	const pipeline = await response.json()

	return {
		searchParams,
		pipeline,
	}
}) satisfies PageLoad
