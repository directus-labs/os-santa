import type { CarolResponse } from '#shared/types/endpoints.js';

export default defineEventHandler(async (event): Promise<CarolResponse> => {
	const slug = getRouterParam(event, 'slug');

	if (!slug) {
		throw createError({
			statusCode: 400,
			message: 'Slug is required',
		});
	}

	try {
		const [carol] = await directusServer.request(
			readItems('profiles_carols', {
				filter: { slug: { _eq: slug } },
				limit: 1,
			}),
		);

		if (!carol) {
			throw createError({
				statusCode: 404,
				message: 'Carol not found',
			});
		}

		return {
			...carol,
			is_processing: carol.status === 'pending' || carol.status === 'processing',
		};
	} catch (error: any) {
		if (error.statusCode) {
			throw error;
		}
		console.error('Error fetching carol:', error);
		throw createError({
			statusCode: 500,
			message: 'Failed to fetch carol',
		});
	}
});
