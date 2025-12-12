import { z } from 'zod';
import type { ValidateLinkedInResponse } from '#shared/types/endpoints.js';

const linkedInUrlSchema = z.object({
	url: z
		.string()
		.url()
		.refine(
			(url) => {
				const linkedInPattern = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i;
				return linkedInPattern.test(url);
			},
			{ message: 'Invalid LinkedIn profile URL format. Expected: https://linkedin.com/in/username' },
		),
});

export default defineEventHandler(async (event): Promise<ValidateLinkedInResponse> => {
	const body = await readValidatedBody(event, (body) => linkedInUrlSchema.parse(body));
	const { url } = body;

	try {
		// Attempt a HEAD request to verify the URL is reachable
		const response = await $fetch.raw(url, {
			method: 'HEAD',
			redirect: 'follow',
			timeout: 10000,
		});

		// LinkedIn returns 200 for valid profiles
		if (response.status >= 200 && response.status < 400) {
			return {
				valid: true,
				message: 'LinkedIn profile is reachable',
			};
		}

		return {
			valid: false,
			message: 'LinkedIn profile not found or not accessible',
		};
	} catch (error: any) {
		// LinkedIn may block HEAD requests, try GET with minimal data
		try {
			const response = await $fetch.raw(url, {
				method: 'GET',
				redirect: 'follow',
				timeout: 10000,
				headers: {
					'User-Agent': 'Mozilla/5.0 (compatible; CarolBot/1.0)',
				},
			});

			if (response.status >= 200 && response.status < 400) {
				return {
					valid: true,
					message: 'LinkedIn profile is reachable',
				};
			}

			return {
				valid: false,
				message: 'LinkedIn profile not found or not accessible',
			};
		} catch (getError: any) {
			// If we get a 999 status (LinkedIn's bot detection) or redirect,
			// the profile likely exists but we can't verify directly
			if (getError?.response?.status === 999 || getError?.response?.status === 302) {
				return {
					valid: true,
					message: 'LinkedIn profile URL format is valid (unable to verify accessibility)',
				};
			}

			return {
				valid: false,
				message: getError?.message || 'Unable to verify LinkedIn profile',
			};
		}
	}
});
