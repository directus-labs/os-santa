<script setup lang="ts">
import { useClipboard } from '@vueuse/core';
import type { ProfileResponse } from '#shared/types/endpoints.js';
import { H3Error } from 'h3';
const route = useRoute();
const { url } = useSiteConfig();
const {
	public: { directusUrl },
} = useRuntimeConfig();

const toast = useToast();
const redirect = useCookie('redirect_uri');

const { loggedIn, user } = useUserSession();

const { data, status, error, refresh } = await useAsyncData<ProfileResponse>(`letter-${route.params.username}`, () =>
	$fetch<ProfileResponse>(`/api/profiles/${route.params.username as string}`, {
		method: 'GET',
	}),
);

if (error.value) {
	throw createError({
		statusCode: 404,
		statusMessage: 'Profile not found',
		fatal: true,
	});
}

const showLetter = ref(false);

const letterContent = computed(() => {
	const { mainContent, postScript } = splitLetterContent(data.value?.letter || '');
	return {
		main: markdownToHtml(mainContent),
		ps: postScript ? markdownToHtml(postScript) : null,
	};
});

const shouldAnimate = computed(() => data.value?.list !== null && data.value?.is_new !== true);

const list: Ref<ProfileResponse['list'] | null> = computed(() => data.value?.list || null);

const username = computed(() => route.params.username as string);
const avatarUrl = computed(() => `https://github.com/${username.value}.png`);
const githubUrl = computed(() => `https://github.com/${username.value}`);
const possibleRoasts = computed(() => data.value?.metadata?.possible_roasts || []);

const currentUrl = useRequestURL();

const { copy } = useClipboard({ source: currentUrl.toString() });
const copied = ref(false);
function copyUrl() {
	copy();
	toast.add({
		title: 'Copied!',
		description: 'Link copied to clipboard!',
	});
	setTimeout(() => {
		copied.value = false;
	}, 2000);
}

useSeoMeta({
	title: `${username.value}`,
	description: `Is ${username.value} on the Open Source Santa's naughty or nice list?`,
});

defineOgImageComponent('Username', {
	username: username.value,
	avatarUrl: avatarUrl.value,
});

function loginWithGithub(redirectUri?: string) {
	redirect.value = redirectUri;
	return navigateTo(`${url}/auth/github`, {
		external: true,
	});
}

const isOwner = computed(() => loggedIn.value && user.value?.login === username.value);
const isPublic: Ref<boolean> = ref(data.value?.is_public ?? true);

async function toggleVisibility() {
	if (!isOwner.value) return;

	try {
		const response = await $fetch<ProfileResponse>(`/api/profiles/${username.value}/visibility`, {
			method: 'POST',
			body: {
				is_public: !isPublic.value,
			},
		});

		isPublic.value = response.is_public ?? true;
		toast.add({
			title: 'Visibility Updated',
			description: `Your letter is now ${isPublic.value ? 'public' : 'private'}`,
			color: 'success',
			icon: 'lucide:circle-check',
		});
	} catch (error) {
		console.error('Error updating visibility:', error);
		toast.add({
			title: 'Error',
			description: 'Something went wrong updating your visibility. Please try again.',
			color: 'error',
			icon: 'lucide:triangle-alert',
		});
	}
}

const loadingVoiceover = ref(false);

async function createVoiceover() {
	loadingVoiceover.value = true;

	// Add loading message
	toast.add({
		id: 'voiceover-loading',
		title: 'Asking Santa to read your letter...',
		description: 'Hold tight while Santa warms up his sweet, Scottish pipes...',
		color: 'info',
		icon: 'lucide:loader',
		duration: 5000,
	});
	try {
		const response = await $fetch(`/api/profiles/${username.value}/voiceover`, {
			method: 'POST',
			body: {
				text: data.value?.letter,
			},
		});
		refresh();
	} catch (error) {
		if (error instanceof Error && (error as any).data.statusCode === 401) {
			toast.add({
				id: 'voiceover-error',
				title: 'Error creating voiceover.',
				description: (error as any).data?.message ?? 'Authentication error',
				color: 'error',
				icon: 'lucide:triangle-alert',
				actions: [
					{
						label: 'Login to GitHub',
						icon: 'lucide:github',
						color: 'neutral',
						size: 'lg',
						onClick: (e) => {
							loginWithGithub(`/${username.value}`);
						},
					},
				],
			});
		} else {
			toast.add({
				id: 'voiceover-error',
				title: 'Error creating voiceover.',
				description: 'Please try again later.',
				color: 'error',
				icon: 'lucide:triangle-alert',
			});
		}
	} finally {
		toast.remove('voiceover-loading');
		loadingVoiceover.value = false;
	}
}
</script>

<template>
	<div class="relative">
		<UContainer class="pt-12 relative">
			<!-- Festive Header -->
			<div class="text-center mb-8">
				<BaseHeadline content="Salty Open Source Santa" size="lg" shadow />
				<BaseText as="p" size="lg" class="mx-auto max-w-md text-red-200 mt-4">
					Are you on the open source naughty or nice list? Test your open source spirit below.
				</BaseText>
			</div>

			<div class="relative max-w-sm mx-auto">
				<div class="relative w-full">
					<NiceGauge
						:animate="shouldAnimate"
						:list="list"
						class="w-full mx-auto relative"
						@animation-completed="showLetter = true"
					/>
					<div class="absolute bottom-11 w-full justify-center flex items-center">
						<img
							:src="avatarUrl"
							:alt="username"
							class="w-24 h-24 rounded-full bg-white border-8 border-gray-900 shadow-lg mx-auto"
						/>
					</div>
					<div class="w-full mt-2 flex justify-center">
						<NuxtLink
							:to="githubUrl"
							target="_blank"
							class="text-white hover:text-yellow-300 font-bold font-mono text-3xl transition"
						>
							{{ username }}
						</NuxtLink>
					</div>
				</div>
				<UButtonGroup v-if="list !== null" size="xl" class="w-full mt-4 relative">
					<UInput :value="currentUrl" readonly class="font-mono w-full" />
					<UButton icon="uil:copy" variant="solid" color="primary" @click="() => copyUrl()" />
				</UButtonGroup>
			</div>
			<div class="relative pt-12 wrapper">
				<aside class="left" v-if="list !== null">
					<div class="lg:sticky lg:top-20 lg:mt-12">
						<!-- Roast a Friend -->
						<template v-if="possibleRoasts.length > 0">
							<p class="text-red-200 text-2xl text-center font-cursive -rotate-2 mt-8">Roast a teammate</p>
							<div class="flex flex-wrap md:flex-nowrap md:flex-col gap-4 mt-2">
								<ULink
									v-for="roast in data?.metadata?.possible_roasts"
									:key="roast.login"
									:to="{
										path: '/',
										query: {
											mode: 'friend',
											profileType: 'User',
											username: roast.login,
										},
									}"
								>
									<User
										:username="roast.login"
										:avatar="roast.avatarUrl"
										size="sm"
										class="md:opacity-75 md:hover:opacity-100 transition-opacity duration-150 text-white"
									/>
								</ULink>
							</div>
						</template>
					</div>
				</aside>

				<div class="content">
					<NotebookPaper v-if="data?.is_new" class="relative text-center space-y-6 bg-red-900/80 p-4 rounded-lg">
						<BaseHeadline content="Letter Not Found" size="lg" color="secondary" />
						<BaseText as="p" size="lg" class="mx-auto max-w-md mt-4">
							It looks like Santa doesn't have a letter for
							<span class="font-bold font-mono">{{ username }}</span>
							yet. That's a shame! Would you like to write it?
						</BaseText>
						<div class="flex justify-center gap-4 mt-4 pb-8">
							<UButton
								v-if="!loggedIn"
								variant="solid"
								color="neutral"
								size="xl"
								@click="loginWithGithub(`/?mode=friend&username=${username}&profileType=${data?.type}`)"
							>
								<Icon name="mdi:github" class="mr-2" />
								Sign in with GitHub to Write Letter
							</UButton>

							<UButton
								v-else
								variant="solid"
								trailing-icon="lucide:arrow-right"
								size="xl"
								:to="{
									path: '/',
									query: {
										mode: 'friend',
										username: username,
										profileType: data?.type,
									},
								}"
							>
								Write Letter to Santa on behalf of {{ username }}
							</UButton>
						</div>
					</NotebookPaper>
					<SantaLetterPaper v-show="showLetter" class="max-w-3xl mx-auto letter-unfold mt-4">
						<img src="/images/os-santa.svg" class="absolute bottom-0 right-0 w-32 md:w-64 -mb-16 md:-mb-32 z-10" />
						<!-- Visiblity Switch for privacy minded folks -->
						<UFormField
							v-if="isOwner"
							label="Show Publicly"
							size="xl"
							class="md:absolute z-20 md:top-8 left-8 flex items-center gap-4"
						>
							<USwitch :model-value="isPublic" @update:model-value="toggleVisibility" name="visibility" />
						</UFormField>
						<div v-if="status === 'pending'" class="text-center py-4">
							<p class="text-gray-600 mt-2">Loading your letter...</p>
						</div>
						<div v-else-if="error" class="text-center text-red-600 py-4">
							Oops! Something went wrong loading the letter.
						</div>
						<!-- Letter Content -->
						<div v-else-if="data" class="relative w-full md:mb-36" v-auto-animate>
							<!-- Voiceover Player -->
							<template v-if="data?.letter_voiceover">
								<SantaLetterContent
									:letter-content="letterContent.main"
									:letter-voiceover-metadata="data?.letter_voiceover_metadata"
									:audio-url="`${directusUrl}/assets/${data?.letter_voiceover}.mp3`"
								/>
							</template>

							<template v-else>
								<!-- Audio Controls -->
								<div class="sticky top-0 md:top-20 z-50">
									<div v-if="error" class="text-red-500 mb-2 px-4">
										{{ error }}
									</div>

									<div
										class="relative p-4 border-b-4 border-red-900/10 flex flex-col md:flex-row md:justify-between md:items-end gap-4"
									>
										<div class="relative flex-shrink-0">
											<img src="/images/bunny.svg" class="h-32 w-auto" />
											<p
												class="absolute w-80 top-0 left-16 border-2 border-gray-800 px-4 py-2 rounded-full bg-white after:content-[''] after:absolute after:border-[10px] after:border-transparent after:border-t-gray-800 after:-bottom-[20px] after:left-4 after:-translate-x-[50%] after:border-l-gray-800 after:rotate-12"
											>
												Want Santa to read your letter to you?
											</p>
										</div>

										<div class="w-full md:w-auto">
											<div class="flex w-full items-center gap-4">
												<UButton
													:loading="loadingVoiceover"
													@click="createVoiceover"
													variant="solid"
													class="rounded-full px-6 py-3"
													size="xl"
												>
													Please Santa Read My Letter 🙏
												</UButton>
											</div>
										</div>

										<div class="flex justify-end md:block">
											<span class="font-mono text-xs md:text-sm text-gray-700">Powered by</span>
											<a
												href="https://try.elevenlabs.io/gvla6ucwspc9?ref=os-santa"
												target="_blank"
												class="opacity-75 hover:opacity-100 transition duration-150 ml-2"
											>
												<img src="/images/elevenlabs-logo-black.png" class="h-3 md:h-4 mt-1" />
											</a>
										</div>
									</div>
								</div>

								<div
									class="relative z-10 mt-8 prose md:px-4 text-2xl text-gray-900 md:text-3xl font-cursive"
									v-html="letterContent.main"
								/>
								<div
									v-if="letterContent.ps"
									class="relative z-10 prose text-gray-900 md:px-4 text-2xl md:text-3xl font-cursive mt-8"
									v-html="letterContent.ps"
								/>
							</template>
							<p class="relative z-10 prose text-gray-900 text-2xl md:px-4 md:text-3xl font-cursive mt-8">
								Sarcastically yours,
								<br />
								<span class="font-bold text-red-900">Salty Open Source Santa</span>
							</p>
						</div>
					</SantaLetterPaper>
				</div>

				<aside class="right" v-if="list !== null">
					<div class="sticky top-20 mt-12">
						<!-- Like Button -->
						<ClientOnly>
							<p class="text-2xl font-cursive text-red-200 -rotate-2 text-center">Spicy-ness</p>
							<SpiceMeter :username class="w-32 mx-auto" />
						</ClientOnly>

						<!-- Sharing -->
						<p class="text-red-200 text-2xl text-center font-cursive -rotate-2 mt-8">Sharing is Caring</p>
						<SocialShare class="text-4xl flex items-center space-x-3 text-white mt-4 justify-center">
							<SocialShareTwitter class="hover:text-green-500" />
							<SocialShareReddit class="hover:text-green-500" />
							<SocialShareLinkedIn class="hover:text-green-500" />
						</SocialShare>
					</div>
				</aside>
			</div>
		</UContainer>
	</div>
</template>

<style>
.text-shadow {
	text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

@keyframes unfold {
	0% {
		transform: perspective(1000px) rotateX(90deg);
		transform-origin: top;
		opacity: 0;
	}
	100% {
		transform: perspective(1000px) rotateX(0deg);
		transform-origin: top;
		opacity: 1;
	}
}

.letter-unfold {
	animation: unfold 1.2s ease-out forwards;
	backface-visibility: hidden;
	transform-style: preserve-3d;
}

.wrapper {
	display: flex;
	flex-direction: column;
	position: relative;
}

/* On mobile, we want this order: content -> left -> right */
.content {
	order: 1;
}

.left {
	order: 2;
	margin-top: 2rem;
}

.right {
	order: 3;
	margin-top: 2rem;
}

@media (min-width: 64rem) {
	.wrapper {
		display: grid;
		grid-template-columns: 1fr 4fr 1fr;
		grid-column-gap: 32px;
	}

	.left {
		grid-column: 1;
		position: relative;
		margin-top: 0;
		order: unset;
	}

	.right {
		grid-column: 3;
		position: relative;
		margin-top: 0;
		order: unset;
	}

	.content {
		grid-column: 2;
		order: unset;
	}
}
</style>
