<script setup lang="ts">
import { useClipboard } from '@vueuse/core';
import type { CarolResponse } from '#shared/types/endpoints.js';

const route = useRoute();
const {
	public: { directusUrl },
} = useRuntimeConfig();

const toast = useToast();

const slug = computed(() => route.params.slug as string);

const { data, status, error, refresh } = await useAsyncData<CarolResponse>(`carol-${slug.value}`, () =>
	$fetch<CarolResponse>(`/api/carols/${slug.value}`, { method: 'GET' }),
);

if (error.value) {
	throw createError({
		statusCode: 404,
		statusMessage: 'Carol not found',
		fatal: true,
	});
}

const currentUrl = useRequestURL();

const { copy } = useClipboard({ source: currentUrl.toString() });

function copyUrl() {
	copy();
	toast.add({
		title: 'Copied!',
		description: 'Link copied to clipboard!',
	});
}

// Poll for updates if carol is processing
const pollInterval = ref<ReturnType<typeof setInterval> | null>(null);

onMounted(() => {
	if (data.value?.is_processing) {
		pollInterval.value = setInterval(async () => {
			await refresh();
			if (!data.value?.is_processing && pollInterval.value) {
				clearInterval(pollInterval.value);
				pollInterval.value = null;
			}
		}, 5000);
	}
});

onUnmounted(() => {
	if (pollInterval.value) {
		clearInterval(pollInterval.value);
	}
});

const audioUrl = computed(() => {
	if (data.value?.carol_file_url) {
		return data.value.carol_file_url;
	}
	if (data.value?.carol_file) {
		const fileId = typeof data.value.carol_file === 'string' ? data.value.carol_file : data.value.carol_file.id;
		return `${directusUrl}/assets/${fileId}`;
	}
	return null;
});

useSeoMeta({
	title: `${data.value?.profile_name}'s Christmas Carol`,
	description: `Listen to a personalized Christmas carol created for ${data.value?.profile_name}!`,
});

defineOgImageComponent('Carol', {
	profileName: data.value?.profile_name ?? 'Someone Special',
	title: data.value?.title ?? 'A Christmas Carol',
});
</script>

<template>
	<div class="relative">
		<UContainer class="pt-12 relative">
			<!-- Header -->
			<div class="text-center mb-8">
				<BaseHeadline content="LinkedIn Carolling" size="lg" shadow />
				<BaseText as="p" size="lg" class="mx-auto max-w-md text-red-200 mt-4">A personalized Christmas carol</BaseText>
			</div>

			<div class="relative max-w-3xl mx-auto">
				<!-- Processing State -->
				<NotebookPaper v-if="data?.is_processing" class="text-center py-12">
					<div class="flex flex-col items-center gap-6 px-8">
						<div class="text-6xl animate-bounce">🎵</div>
						<h2 class="text-2xl md:text-3xl font-bold text-gray-900 font-cursive">Creating your carol...</h2>
						<p class="text-gray-700 text-lg font-cursive max-w-md">
							Our musical elves are composing a special carol for
							<span class="font-bold">{{ data?.profile_name }}</span>
							. This page will update automatically when it's ready!
						</p>
						<UProgress animation="carousel" class="w-64" />
						<p class="text-gray-600 text-sm font-mono">Status: {{ data?.status }}</p>
					</div>
				</NotebookPaper>

				<!-- Error State -->
				<NotebookPaper v-else-if="data?.status === 'error'" class="text-center py-12">
					<div class="flex flex-col items-center gap-6 px-8">
						<div class="text-6xl">😢</div>
						<h2 class="text-2xl md:text-3xl font-bold text-gray-900 font-cursive">Something went wrong</h2>
						<p class="text-gray-700 text-lg font-cursive max-w-md">
							We couldn't create the carol. Please try again later.
						</p>
						<p v-if="data?.error_details" class="text-red-600 text-sm font-mono">
							{{ data.error_details }}
						</p>
						<UButton to="/" variant="solid" size="xl" class="bg-green-600 hover:bg-green-700">Try Again</UButton>
					</div>
				</NotebookPaper>

				<!-- Completed Carol -->
				<NotebookPaper v-else-if="data?.status === 'completed'" class="py-8">
					<div class="flex flex-col gap-6 px-8">
						<!-- Title Section -->
						<div class="text-center">
							<p class="text-gray-600 text-lg font-cursive">A Christmas Carol for</p>
							<h1 class="text-3xl md:text-4xl font-bold text-gray-900 font-cursive mt-2">
								{{ data?.profile_name }}
							</h1>
							<p v-if="data?.title" class="text-2xl text-red-900 font-cursive italic mt-4">"{{ data.title }}"</p>
						</div>

						<!-- Audio Player -->
						<div v-if="audioUrl" class="bg-red-50 rounded-xl p-6 border-2 border-red-200">
							<audio :src="audioUrl" controls class="w-full" controlsList="nodownload" />
						</div>

						<!-- Lyrics -->
						<div v-if="data?.lyrics" class="mt-4">
							<h3 class="text-xl font-bold text-gray-900 font-cursive mb-4 text-center">Lyrics</h3>
							<div
								class="prose prose-lg text-gray-800 font-cursive whitespace-pre-wrap text-center"
								v-html="data.lyrics"
							/>
						</div>

						<!-- Share Section -->
						<div class="border-t-2 border-red-200 pt-6 mt-4">
							<p class="text-gray-700 font-cursive text-center mb-4">Share this carol with friends!</p>
							<div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
								<UFieldGroup size="xl" class="w-full max-w-md">
									<UInput :value="currentUrl" readonly class="font-mono" />
									<UButton icon="uil:copy" variant="solid" color="primary" @click="copyUrl" />
								</UFieldGroup>
							</div>
							<div class="flex justify-center gap-4 mt-4">
								<SocialShare class="text-3xl flex items-center space-x-3 text-gray-700">
									<SocialShareTwitter class="hover:text-green-600" />
									<SocialShareLinkedIn class="hover:text-green-600" />
								</SocialShare>
							</div>
						</div>

						<!-- Create Another -->
						<div class="text-center mt-4">
							<UButton to="/" variant="outline" size="lg">Create Another Carol</UButton>
						</div>
					</div>
				</NotebookPaper>

				<!-- Loading State -->
				<NotebookPaper v-else-if="status === 'pending'" class="text-center py-12">
					<div class="flex flex-col items-center gap-4">
						<UProgress animation="carousel" class="w-64" />
						<p class="text-gray-600">Loading carol...</p>
					</div>
				</NotebookPaper>
			</div>
		</UContainer>
	</div>
</template>

<style scoped>
audio::-webkit-media-controls-panel {
	background-color: #fef2f2;
}
</style>
