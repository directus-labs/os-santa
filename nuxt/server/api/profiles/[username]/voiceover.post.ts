import { ElevenLabsClient } from 'elevenlabs';
import { z } from 'zod';

// Schema for the request body
const voiceoverSchema = z.object({
	text: z.string().min(1),
});

const VOICEOVER_SETTINGS = {
	stability: 0.8,
	style: 0.2,
	similarity_boost: 1,
	use_speaker_boost: true,
};

const config = useRuntimeConfig();

// Initialize ElevenLabs client
const client = new ElevenLabsClient({
	apiKey: config.elevenLabs.apiKey as string,
});

export default defineEventHandler(async (event) => {
	const username = getRouterParam(event, 'username');
	const session = await getUserSession(event);

	if (!username) {
		throw createError({
			statusCode: 400,
			message: 'Username is required',
		});
	}

	if (!session || !session.user) {
		throw createError({
			statusCode: 401,
			message: 'Unauthorized. Please login to generate voiceovers.',
		});
	}

	try {
		const body = await readValidatedBody(event, (body) => voiceoverSchema.parse(body));

		// Generate speech with timestamps
		const response = await client.textToSpeech.convertWithTimestamps(config.elevenLabs.voiceId as string, {
			model_id: 'eleven_multilingual_v2',
			text: body.text,
			voice_settings: VOICEOVER_SETTINGS,
		});

		// Convert base64 audio to buffer
		const audioBuffer = Buffer.from(response.audio_base64, 'base64');

		const filename = `voiceover-${username}-${Date.now()}.mp3`;

		const formData = new FormData();
		const rawFile = new File([audioBuffer], filename, { type: 'audio/mpeg' });

		formData.append('file', rawFile);

		// Then append the metadata
		formData.append('title', `Voiceover for ${username}`);
		formData.append('filename_download', filename);

		// Create file in Directus
		const file = await directusServer.request(uploadFiles(formData));

		// Update profile with the voiceover file
		const profile = await directusServer.request(
			updateItem('profiles', username, {
				letter_voiceover: file.id,
				letter_voiceover_metadata: JSON.stringify({
					alignment: response.alignment,
					normalized_alignment: response.normalized_alignment,
					text: body.text,
					voice_id: config.elevenLabs.voiceId,
					voice_settings: VOICEOVER_SETTINGS,
				}),
			}),
		);

		return profile;
	} catch (uploadError) {
		console.error('Directus upload error:', {
			status: uploadError.response?.status,
			statusText: uploadError.response?.statusText,
			headers: Object.fromEntries(uploadError.response?.headers?.entries() || []),
			error: uploadError.errors?.[0]?.message || uploadError.message,
		});
		throw createError({
			statusCode: 500,
			message: 'Failed to upload file to Directus',
		});
	}
});
