import { z } from 'zod';
import type { SubmitCarolResponse } from '#shared/types/endpoints.js';

const submitCarolSchema = z.object({
	linkedin_profile_url: z
		.string()
		.url()
		.refine(
			(url) => {
				const linkedInPattern = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i;
				return linkedInPattern.test(url);
			},
			{ message: 'Invalid LinkedIn profile URL format' },
		),
	submitted_by_email: z.string().email({ message: 'Invalid email address' }),
	submitted_by_name: z.string().min(1, { message: 'Name is required' }).max(100),
});

export default defineEventHandler(async (event): Promise<SubmitCarolResponse> => {
	const config = useRuntimeConfig();

	// Validate the request body
	const body = await readValidatedBody(event, (body) => submitCarolSchema.parse(body));
	const { linkedin_profile_url, submitted_by_email, submitted_by_name } = body;

	// Validate LinkedIn URL is reachable
	try {
		const validationResponse = await $fetch<{ valid: boolean; message?: string }>('/api/validate-linkedin', {
			method: 'POST',
			body: { url: linkedin_profile_url },
			baseURL: config.public.siteUrl,
		});

		if (!validationResponse.valid) {
			throw createError({
				statusCode: 400,
				message: validationResponse.message || 'LinkedIn profile URL is not reachable',
			});
		}
	} catch (error: any) {
		if (error.statusCode === 400) {
			throw error;
		}
		// If validation endpoint fails, continue anyway
		console.warn('LinkedIn validation failed, proceeding with submission:', error.message);
	}

	// Submit to Clay webhook
	const webhookUrl = config.clay.webhookUrl;
	const webhookAuth = config.clay.webhookAuth;

	if (!webhookUrl || !webhookAuth) {
		throw createError({
			statusCode: 500,
			message: 'Clay webhook configuration is missing',
		});
	}

	try {
		const clayResponse = await $fetch(webhookUrl, {
			method: 'POST',
			headers: {
				'x-clay-webhook-auth': webhookAuth,
				'Content-Type': 'application/json',
			},
			body: {
				linkedin_profile_url,
				submitted_by_email,
				submitted_by_name,
			},
		});

		return {
			success: true,
			message: 'Your carol request has been submitted! You will receive an email when it is ready.',
			redirect: '/submitted',
		};
	} catch (error: any) {
		console.error('Clay webhook error:', error);
		throw createError({
			statusCode: 500,
			message: 'Failed to submit carol request. Please try again.',
		});
	}
});
