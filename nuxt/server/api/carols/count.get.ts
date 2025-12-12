import type { CarolCountResponse } from '#shared/types/endpoints.js';

export default defineEventHandler(async (event): Promise<CarolCountResponse> => {
	try {
		const result = await directusServer.request(
			aggregate('profiles_carols', {
				aggregate: { count: '*' },
				query: {
					filter: { status: { _eq: 'completed' } },
				},
			}),
		);

		return {
			count: Number(result[0]?.count ?? 0),
		};
	} catch (error: any) {
		console.error('Error fetching carol count:', error);
		return {
			count: 0,
		};
	}
});
