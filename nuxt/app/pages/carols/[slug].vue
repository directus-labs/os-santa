<script setup lang="ts">
import { useClipboard } from '@vueuse/core';
import type { CarolResponse, UnfurlResponse } from '#shared/types/endpoints.js';

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

// Fetch LinkedIn profile metadata for profile image (non-blocking)
const { data: unfurlData } = useLazyFetch<UnfurlResponse>('/api/unfurl', {
	query: { url: data.value?.linkedin_profile_url },
	immediate: !!data.value?.linkedin_profile_url,
});

const profileImage = computed(() => unfurlData.value?.image);

const initials = computed(() => {
	const name = data.value?.profile_name ?? '';
	const parts = name.split(' ').filter(Boolean);
	if (parts.length >= 2) {
		const first = parts[0]?.[0] ?? '';
		const last = parts[parts.length - 1]?.[0] ?? '';
		return (first + last).toUpperCase() || '?';
	}
	return name.slice(0, 2).toUpperCase() || '?';
});

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

// Custom audio player state
const audioRef = ref<HTMLAudioElement | null>(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);

function togglePlay() {
	if (!audioRef.value) return;
	if (isPlaying.value) {
		audioRef.value.pause();
	} else {
		audioRef.value.play();
	}
}

function onTimeUpdate() {
	if (audioRef.value) {
		currentTime.value = audioRef.value.currentTime;
	}
}

function onLoadedMetadata() {
	if (audioRef.value) {
		duration.value = audioRef.value.duration;
	}
}

function onSeek(event: Event) {
	const target = event.target as HTMLInputElement;
	if (audioRef.value) {
		audioRef.value.currentTime = parseFloat(target.value);
	}
}

function formatTime(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${mins}:${secs.toString().padStart(2, '0')}`;
}

const progress = computed(() => {
	if (duration.value === 0) return 0;
	return (currentTime.value / duration.value) * 100;
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
			<div class="mb-8">
				<div class="flex items-center justify-center gap-4">
					<!-- Profile Avatar - only show when completed -->
					<div v-if="data?.status === 'completed'" class="shrink-0">
						<img
							v-if="profileImage"
							:src="profileImage"
							:alt="data?.profile_name ?? 'Profile'"
							class="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg ring-2 ring-primary/30"
						/>
						<div
							v-else
							class="w-24 h-24 rounded-full bg-red-600 text-white flex items-center justify-center text-xl font-bold border-4 border-white shadow-lg ring-2 ring-primary/30"
						>
							{{ initials }}
						</div>
					</div>
					<!-- Title and Copy Link -->
					<div class="text-center">
						<BaseHeadline :content="data?.title ?? 'LinkedIn Carolling'" size="lg" shadow />
						<!-- Copy Link - only show when completed -->
						<div v-if="data?.status === 'completed'" class="mt-4 flex justify-center">
							<UFieldGroup size="lg" class="w-full max-w-md">
								<UInput :model-value="currentUrl.toString()" readonly class="font-mono text-sm w-full" />
								<UButton icon="i-heroicons-clipboard" color="primary" @click="copyUrl" />
							</UFieldGroup>
						</div>
					</div>
				</div>
			</div>

			<div class="relative max-w-3xl mx-auto">
				<img src="/images/carolers.png" alt="Carolers" class="w-full" />
				<!-- Processing State -->
				<FeltPaper v-if="data?.is_processing" class="text-center py-12">
					<div class="flex flex-col items-center gap-6 px-8">
						<!-- Profile Avatar -->
						<div class="relative">
							<img
								v-if="profileImage"
								:src="profileImage"
								:alt="data?.profile_name ?? 'Profile'"
								class="w-24 h-24 rounded-full object-cover border-4 border-red-200 shadow-lg"
							/>
							<div
								v-else
								class="w-24 h-24 rounded-full bg-red-600 text-white flex items-center justify-center text-3xl font-bold border-4 border-red-200 shadow-lg"
							>
								{{ initials }}
							</div>
							<div class="absolute -bottom-2 -right-2 text-4xl animate-bounce">🎵</div>
						</div>
						<h2 class="text-2xl md:text-3xl font-bold text-gray-900 font-cursive">Creating your carol...</h2>
						<p class="text-gray-700 text-lg font-cursive max-w-md">
							Our musical elves are composing a special carol for
							<span class="font-bold">{{ data?.profile_name }}</span>
							. This page will update automatically when it's ready!
						</p>
						<UProgress animation="carousel" class="w-64" />
						<p class="text-gray-600 text-sm font-mono">Status: {{ data?.status }}</p>
					</div>
				</FeltPaper>

				<!-- Error State -->
				<FeltPaper v-else-if="data?.status === 'error'" class="text-center py-12">
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
				</FeltPaper>

				<!-- Completed Carol -->
				<div v-else-if="data?.status === 'completed'" class="relative -mt-16">
					<!-- Carolers standing on top of felt paper -->

					<!-- Social Share Sidebar -->
					<div class="absolute -right-16 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3">
						<SocialShare class="flex flex-col gap-3">
							<SocialShareTwitter class="text-2xl text-white hover:text-primary-200 transition-colors" />
							<SocialShareLinkedIn class="text-2xl text-white hover:text-primary-200 transition-colors" />
						</SocialShare>
					</div>

					<FeltPaper color="cream">
						<div class="flex flex-col gap-6 px-8">
							<!-- Custom Felt Audio Player -->
							<div v-if="audioUrl" class="">
								<!-- Hidden audio element -->
								<audio
									ref="audioRef"
									:src="audioUrl"
									@timeupdate="onTimeUpdate"
									@loadedmetadata="onLoadedMetadata"
									@play="isPlaying = true"
									@pause="isPlaying = false"
									@ended="isPlaying = false"
								/>

								<div class="flex items-center gap-4">
									<!-- Play/Pause Button -->
									<button
										class="w-14 h-14 rounded-full bg-primary flex items-center justify-center transition-all hover:scale-105 active:scale-95"
										@click="togglePlay"
									>
										<UIcon
											:name="isPlaying ? 'i-heroicons-pause-solid' : 'i-heroicons-play-solid'"
											class="w-7 h-7 text-white"
											:class="{ 'ml-1': !isPlaying }"
										/>
									</button>

									<!-- Progress & Time -->
									<div class="flex-1">
										<!-- Progress Bar -->
										<div class="relative h-2 bg-primary/20 rounded-full overflow-hidden">
											<div
												class="absolute inset-y-0 left-0 bg-primary rounded-full transition-all"
												:style="{ width: `${progress}%` }"
											/>
											<input
												type="range"
												min="0"
												:max="duration"
												:value="currentTime"
												class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
												@input="onSeek"
											/>
										</div>
										<!-- Time Display -->
										<div class="flex justify-between mt-2 text-xs text-primary font-mono">
											<span>{{ formatTime(currentTime) }}</span>
											<span>{{ formatTime(duration) }}</span>
										</div>
									</div>
								</div>
							</div>

							<!-- Mobile Social Share -->
							<div class="flex justify-center gap-4 lg:hidden pt-4">
								<SocialShare class="flex gap-4">
									<SocialShareTwitter class="text-2xl text-gray-500 hover:text-green-600 transition-colors" />
									<SocialShareLinkedIn class="text-2xl text-gray-500 hover:text-green-600 transition-colors" />
								</SocialShare>
							</div>
						</div>
					</FeltPaper>
					<!-- See Lyrics Button -->
					<UCollapsible v-if="data?.lyrics" class="w-full mt-4">
						<div class="flex justify-center">
							<UButton icon="i-heroicons-musical-note" variant="solid" color="primary" label="Toggle Lyrics" />
						</div>
						<template #content>
							<div class="mt-4 max-h-[300px] overflow-y-auto w-full mx-auto lyrics-scroll bg-sky-900/50 p-4 rounded-lg">
								<div class="prose prose-lg text-white text-center text-balance" v-html="markdownToHtml(data.lyrics)" />
							</div>
						</template>
					</UCollapsible>
				</div>

				<!-- Loading State -->
				<FeltPaper v-else-if="status === 'pending'" class="text-center py-12">
					<div class="flex flex-col items-center gap-4">
						<UProgress animation="carousel" class="w-64" />
						<p class="text-gray-600">Loading carol...</p>
					</div>
				</FeltPaper>
			</div>
		</UContainer>
	</div>
</template>

<style scoped>
.felt-player {
	box-shadow:
		inset 0 2px 4px rgba(0, 0, 0, 0.1),
		0 4px 12px rgba(0, 0, 0, 0.15);
}

.felt-player::before {
	content: '';
	position: absolute;
	inset: 0;
	background: url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
	opacity: 0.03;
	pointer-events: none;
	border-radius: inherit;
}

/* Custom scrollbar for lyrics */
.lyrics-scroll {
	scrollbar-width: thin;
	scrollbar-color: rgba(255, 255, 255, 0.1) rgba(255, 255, 255, 0.1);
}

.lyrics-scroll::-webkit-scrollbar {
	width: 8px;
}

.lyrics-scroll::-webkit-scrollbar-track {
	background: rgba(255, 255, 255, 0.1);
	border-radius: 4px;
}

.lyrics-scroll::-webkit-scrollbar-thumb {
	background: linear-gradient(180deg, #ffffff, #e0e0e0);
	border-radius: 4px;
}

.lyrics-scroll::-webkit-scrollbar-thumb:hover {
	background: linear-gradient(180deg, #ffffff, #e0e0e0);
}
</style>
