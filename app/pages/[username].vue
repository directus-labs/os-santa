<script setup lang="ts">
const route = useRoute();
const toast = useToast();

const { data, pending, error } = useAsyncData(`letter-${route.params.username}`, () =>
	$fetch(`/api/${route.params.username}`, {
		method: 'GET',
	}),
);

const list = ref('naughty');

const showLetter = ref(false);

const letter = computed(() => markdownToHtml(data.value?.letter || ''));

const username = computed(() => route.params.username as string);
const avatarUrl = computed(() => `https://github.com/${username.value}.png`);
const githubUrl = computed(() => `https://github.com/${username.value}`);

const currentUrl = computed(() => (process.client ? window.location.origin + window.location.pathname : ''));

const { copy } = useClipboard({ source: currentUrl });

const copyUrl = () => {
	toast.add({
		title: 'Copied to clipboard',
		description: 'Share this link with your friends',
	});
};

defineOgImageComponent('Username', {
	username: username.value,
	avatarUrl: avatarUrl.value,
});
</script>

<template>
	<div class="">
		<UContainer class="pt-12 relative">
			<!-- Festive Header -->
			<div class="text-center mb-8 space-y-4">
				<BaseHeadline content="Open Source Santa" size="lg" shadow />
				<BaseText as="p" size="lg" class="mx-auto max-w-md text-red-200">
					Are you on the open source naughty or nice list? Test your open source spirit below.
				</BaseText>
			</div>

			<div class="max-w-sm mx-auto">
				<div class="relative w-full">
					<NiceGauge :list="list" class="w-full mx-auto relative" @animation-completed="showLetter = true" />
					<div class="absolute bottom-11 w-full justify-center flex items-center">
						<img
							:src="avatarUrl"
							:alt="username"
							class="w-24 h-24 rounded-full border-8 border-gray-900 shadow-lg mx-auto"
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
				<UButtonGroup size="xl" class="w-full mt-4">
					<UInput :value="currentUrl" readonly class="font-mono w-full" />
					<UButton icon="uil:copy" variant="solid" color="primary" @click="copyUrl" />
				</UButtonGroup>
			</div>
			<Page class="relative pt-12">
				<template #left>
					<!-- Share Buttons -->
					<div class="sticky top-20 mt-12">
						<p class="text-red-200 text-2xl font-cursive -rotate-2">Sharing is Caring</p>
						<SocialShare class="text-4xl flex items-center space-x-3 text-white mt-4 justify-center">
							<SocialShareTwitter class="hover:text-green-500" />
							<SocialShareReddit class="hover:text-green-500" />
							<SocialShareLinkedIn class="hover:text-green-500" />
						</SocialShare>
					</div>
				</template>

				<template #right>
					<div class="sticky top-20 mt-12">
						<!-- Like Button -->
						<ClientOnly>
							<p class="text-2xl font-cursive text-red-200 -rotate-2 text-center">Spicy-ness</p>
							<SpiceMeter
								v-if="showLetter"
								:profile="username"
								:user-count="data?.meta?.userLikeCount"
								:total-count="data?.meta?.totalLikes"
								class="w-32"
							/>
						</ClientOnly>
					</div>
				</template>

				<SantaLetterPaper v-show="showLetter" class="max-w-3xl mx-auto letter-unfold mt-4">
					<img src="/images/os-santa.svg" class="absolute bottom-0 right-0 w-64 -mb-32 z-10" />
					<div v-if="pending" class="text-center py-4">
						<p class="text-gray-600 mt-2">Loading your letter...</p>
					</div>

					<div v-else-if="error" class="text-center text-red-600 py-4">
						Oops! Something went wrong loading the letter.
					</div>

					<div v-else-if="data" class="relative w-full">
						<div class="relative z-10 prose prose-2xl text-gray-900 text-3xl font-cursive" v-html="letter" />
					</div>
				</SantaLetterPaper>
			</Page>
		</UContainer>
	</div>
</template>

<style>
.text-shadow {
	text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}
.bg-gold {
	background-color: #d4af37;
}
.text-gold {
	color: #d4af37;
}
.border-gold {
	border-color: #d4af37;
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

.string {
	pointer-events: none;
}
</style>
