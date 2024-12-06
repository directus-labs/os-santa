<script setup lang="ts">
import { useClipboard } from '@vueuse/core';
import type { ProfileResponse } from '#shared/types/endpoints.js';

const route = useRoute();
const { url } = useSiteConfig();
const redirect = useCookie('redirect_uri');

const { loggedIn, user } = useUserSession();

const { data, status, error } = useAsyncData<ProfileResponse>(`letter-${route.params.username}`, () =>
	$fetch(`/api/profiles/${route.params.username}`, {
		method: 'GET',
	}),
);

const showLetter = ref(false);
const letter = computed(() => markdownToHtml(data.value?.letter || ''));
const shouldAnimate = computed(() => data.value?.list !== null && data.value?.is_new !== true);

const list: Ref<ProfileResponse['list'] | null> = computed(() => data.value?.list || null);
const username = computed(() => route.params.username as string);
const avatarUrl = computed(() => `https://github.com/${username.value}.png`);
const githubUrl = computed(() => `https://github.com/${username.value}`);

const currentUrl = useRequestURL();

const { copy } = useClipboard({ source: currentUrl.toString() });
const copied = ref(false);
function copyUrl() {
	copy();
	copied.value = true;
	setTimeout(() => {
		copied.value = false;
	}, 2000);
}

defineOgImageComponent('Username', {
	username: username.value,
	avatarUrl: avatarUrl.value,
});


function loginWithGithub(redirectUri: string) {
	redirect.value = redirectUri;
	return navigateTo(`${url}/auth/github`, {
		external: true,
	});
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
					<Transition
						enter-active-class="transition-all duration-300"
						leave-active-class="transition-all duration-300"
						mode="out-in"
						enter-from-class="opacity-0"
						leave-to-class="opacity-0"
					>
						<UAlert v-if="copied" title="Copied" description="Link copied to clipboard!" class="absolute -top-1/2" />
					</Transition>
				</div>
				<UButtonGroup v-if="list !== null" size="xl" class="w-full mt-4 relative">
					<UInput :value="currentUrl" readonly class="font-mono w-full" />
					<UButton icon="uil:copy" variant="solid" color="primary" @click="() => copyUrl()" />
				</UButtonGroup>
			</div>
			<div class="relative pt-12 wrapper">
				<aside class="left" v-if="list !== null">
					<!-- Share Buttons -->
					<div class="lg:sticky lg:top-20 lg:mt-12">
						<p class="text-red-200 text-2xl text-center font-cursive -rotate-2">Sharing is Caring</p>
						<SocialShare class="text-4xl flex items-center space-x-3 text-white mt-4 justify-center">
							<SocialShareTwitter class="hover:text-green-500" />
							<SocialShareReddit class="hover:text-green-500" />
							<SocialShareLinkedIn class="hover:text-green-500" />
						</SocialShare>
					</div>
				</aside>

				<div class="content">
					<NotebookPaper v-if="data?.is_new" class="text-center space-y-6 bg-red-900/80 p-4 rounded-lg">
						<BaseHeadline content="Letter Not Found" size="lg" color="secondary"/>
						<BaseText as="p" size="lg" class="mx-auto max-w-md mt-4">
							It looks like Santa doesn't have a letter for <span class="font-bold font-mono">{{ username }}</span> yet. That's a shame! Would you like to write it?
						</BaseText>
						<div class="flex justify-center gap-4 mt-4 pb-8">
							<UButton v-if="!loggedIn" variant="solid" color="neutral" size="xl" @click="loginWithGithub(`/?mode=friend&username=${username}`)">
								<Icon name="mdi:github" class="mr-2" />
								Sign in with Github to Write Letter
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
									},
								}"
							>
								Write Letter to Santa on behalf of {{ username }}
							</UButton>
						</div>
					</NotebookPaper>
					<SantaLetterPaper v-show="showLetter" class="max-w-3xl mx-auto letter-unfold mt-4 p-4">
						<img src="/images/os-santa.svg" class="absolute bottom-0 right-0 w-32 md:w-64 -mb-16 md:-mb-32 z-10" />
						<div v-if="status === 'pending'" class="text-center py-4">
							<p class="text-gray-600 mt-2">Loading your letter...</p>
						</div>
						<div v-else-if="error" class="text-center text-red-600 py-4">
							Oops! Something went wrong loading the letter.
						</div>
						<div v-else-if="data" class="relative w-full">
							<div class="relative z-10 prose prose-2xl text-gray-900 text-3xl font-cursive" v-html="letter" />
							<p class="relative z-10 prose prose-2xl text-gray-900 text-3xl font-cursive mt-8">
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

@media (min-width: 64rem) {
	.wrapper {
		display: grid;
		grid-template-columns: 1fr 4fr 1fr;
		grid-column-gap: 32px;
	}

	.left {
		grid-column: 1;
		position: relative;
	}

	.right {
		grid-column: 3;
		position: relative;
	}

	.content {
		grid-column: 2;
	}
}
</style>
