<script setup lang="ts">
import type { SubmitCarolResponse, CarolCountResponse } from '#shared/types/endpoints.js';

const loading = ref(false);
const linkedinUrl = ref('');
const name = ref('');
const email = ref('');
const errorMessage = ref('');
const toast = useToast();

const { data: carolCount } = await useLazyFetch<CarolCountResponse>('/api/carols/count');

const canSubmit = computed(() => {
	return linkedinUrl.value.length > 0 && name.value.length > 0 && email.value.length > 0;
});

const linkedInPattern = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i;

const isValidLinkedInUrl = computed(() => {
	if (!linkedinUrl.value) return true;
	return linkedInPattern.test(linkedinUrl.value);
});

const isValidEmail = computed(() => {
	if (!email.value) return true;
	const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailPattern.test(email.value);
});

async function handleSubmit() {
	if (!canSubmit.value) return;

	// Validate LinkedIn URL format
	if (!isValidLinkedInUrl.value) {
		errorMessage.value = 'Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/username)';
		return;
	}

	// Validate email format
	if (!isValidEmail.value) {
		errorMessage.value = 'Please enter a valid email address';
		return;
	}

	loading.value = true;
	errorMessage.value = '';

	try {
		const response = await $fetch<SubmitCarolResponse>('/api/submit-carol', {
			method: 'POST',
			body: {
				linkedin_profile_url: linkedinUrl.value,
				submitted_by_email: email.value,
				submitted_by_name: name.value,
			},
		});

		if (response.success && response.redirect) {
			navigateTo(response.redirect);
		} else {
			toast.add({
				title: 'Success!',
				description: response.message,
				color: 'success',
			});
		}
	} catch (error: any) {
		console.error(error);
		errorMessage.value = error?.data?.message || 'Something went wrong. Please try again.';
		toast.add({
			title: 'Error',
			description: errorMessage.value,
			color: 'error',
		});
	} finally {
		loading.value = false;
	}
}

useSeoMeta({
	titleTemplate: 'LinkedIn Carolling - Create a Christmas Carol for Anyone',
	description:
		'Generate a personalized Christmas carol for any LinkedIn profile. Spread holiday cheer with AI-generated festive music!',
});

defineOgImage({ url: '/images/og-image.png', width: 1200, height: 600, alt: 'LinkedIn Carolling' });
</script>

<template>
	<div class="">
		<UContainer class="relative py-8 md:py-16">
			<img src="/images/santa-bunny.png" alt="Santa Bunny" class="w-full h-48 object-contain" />

			<div class="text-center mb-8">
				<p class="text-white text-2xl font-cursive mt-2">
					Over
					<span class="text-3xl font-bold">{{ carolCount?.count ?? 0 }} carols</span>
					created and counting...
				</p>
				<BaseHeadline content="LinkedIn Carolling" size="xl" shadow class="mt-8" />
				<BaseText as="p" size="md" class="mx-auto max-w-md text-red-200 mt-4">
					Create a personalized Christmas carol for any LinkedIn profile. Spread some holiday cheer!
				</BaseText>
			</div>

			<div class="relative max-w-2xl mx-auto">
				<NotebookPaper>
					<UForm
						:state="{
							linkedinUrl,
							name,
							email,
						}"
						class="relative flex flex-col gap-6 border-4 rounded-2xl border-transparent px-8 py-12"
						@submit="handleSubmit"
					>
						<div class="text-2xl md:text-3xl font-bold text-gray-900 mb-4 font-cursive">Create a Christmas Carol</div>

						<div class="space-y-2">
							<p class="text-gray-900 text-xl font-bold font-cursive">LinkedIn Profile URL</p>
							<UFormField block size="xl">
								<UInput
									v-model="linkedinUrl"
									type="url"
									placeholder="https://linkedin.com/in/username"
									variant="soft"
									class="w-full"
									:color="!isValidLinkedInUrl ? 'error' : undefined"
								/>
							</UFormField>
							<p v-if="!isValidLinkedInUrl" class="text-red-600 text-sm font-mono">
								Please enter a valid LinkedIn URL (e.g., https://linkedin.com/in/username)
							</p>
						</div>

						<div class="space-y-2">
							<p class="text-gray-900 text-xl font-bold font-cursive">Your Name</p>
							<UFormField block size="xl">
								<UInput v-model="name" type="text" placeholder="Enter your name" variant="soft" class="w-full" />
							</UFormField>
						</div>

						<div class="space-y-2">
							<p class="text-gray-900 text-xl font-bold font-cursive">Your Email</p>
							<UFormField block size="xl">
								<UInput
									v-model="email"
									type="email"
									placeholder="you@example.com"
									variant="soft"
									class="w-full"
									:color="!isValidEmail ? 'error' : undefined"
								/>
							</UFormField>
							<p v-if="!isValidEmail" class="text-red-600 text-sm font-mono">Please enter a valid email address</p>
							<p class="text-gray-600 text-sm font-mono">We'll email you when your carol is ready!</p>
						</div>

						<UAlert
							v-if="errorMessage"
							icon="lucide:alert-circle"
							:title="errorMessage"
							variant="soft"
							color="error"
							class="mt-2"
						/>

						<UButton
							type="submit"
							:disabled="!canSubmit || !isValidLinkedInUrl || !isValidEmail"
							:loading="loading"
							class="w-full bg-green-600 hover:bg-green-700 text-white"
							size="xl"
						>
							<span class="flex w-full items-center justify-center gap-2">
								<span v-if="!loading">Create My Carol</span>
								<span v-else>Creating magic...</span>
								🎄
							</span>
						</UButton>
					</UForm>
					<p class="max-w-sm text-balance mt-4 text-gray-900 text-center text-sm mx-auto font-mono font-bold">
						Note: We only use publicly available LinkedIn profile information to create your carol.
					</p>
				</NotebookPaper>
			</div>
		</UContainer>
	</div>
</template>

<style scoped>
.text-shadow {
	text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}
</style>
