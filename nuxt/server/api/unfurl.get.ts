import { unfurl } from 'unfurl.js';
import { z } from 'zod';
import type { UnfurlResponse } from '#shared/types/endpoints.js';

const querySchema = z.object({
	url: z.string().min(1),
});

function normalizeUrl(url: string): string {
	// Add https:// if no protocol is present
	if (!url.startsWith('http://') && !url.startsWith('https://')) {
		return `https://${url}`;
	}
	return url;
}

export default defineCachedEventHandler(
	async (event): Promise<UnfurlResponse> => {
		const query = getQuery(event);
		const { url: rawUrl } = querySchema.parse(query);
		const url = normalizeUrl(rawUrl);

		try {
			const metadata = await unfurl(url, {
				timeout: 10000,
				headers: {
					'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
				},
			});

			return {
				title: metadata.title || metadata.open_graph?.title,
				description: metadata.description || metadata.open_graph?.description,
				image: metadata.open_graph?.images?.[0]?.url,
				siteName: metadata.open_graph?.site_name,
			};
		} catch (error: any) {
			console.error('Unfurl error:', error?.message);
			// Return empty response on error - let the frontend handle fallback
			return {};
		}
	},
	{
		maxAge: 60 * 60 * 24 * 30, // 30 days in seconds
		getKey: (event) => {
			const query = getQuery(event);
			const rawUrl = String(query.url || '');
			return `unfurl:${normalizeUrl(rawUrl)}`;
		},
	},
);
