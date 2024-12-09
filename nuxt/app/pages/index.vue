<script setup lang="ts">
import type { GithubProfileType, GithubUser } from '~~/shared/types/github';
import type { RoastResponse, SearchResponse } from '#shared/types/endpoints.js';
type Mode = 'self' | 'friend';

const route = useRoute();
const { loggedIn, user } = useUserSession();
const { url } = useSiteConfig();

const loading = ref(false);
const username: Ref<string> = ref((route.query.username as string) ?? '');
const profileType = ref<GithubProfileType>((route.query.profileType as GithubProfileType) ?? 'User');
const wishlist = ref('');

const avatarUrl = computed(() => {
	return `https://github.com/${username.value}.png`;
});
const isFriendMode = computed(() => route.query.mode === 'friend');
const mode: Ref<Mode> = computed(() => (isFriendMode.value ? 'friend' : 'self'));

const { updateQuery } = useQueryParams();

const canSubmit = computed(() => {
	if (!loggedIn.value) return false;
	if (isFriendMode.value && username.value.length === 0) return false;
	return true;
});

/**
 * Handles the submission of the roast form
 * @returns {Promise<RoastResponse>} The response from the roast endpoint
 */
async function handleSubmit() {
	loading.value = true;

	try {
		const response = await $fetch<RoastResponse>('/api/roast', {
			method: 'POST',
			body: {
				wishlist: wishlist.value,
				profileType: profileType.value,
				username: isFriendMode.value ? username.value : user.value?.login,
				mode: mode.value,
				roasted_by: isFriendMode.value ? user.value?.login : undefined,
				type: () => {
					if (isFriendMode.value) return profileType.value;
					else return (user.value?.type.toLowerCase() as 'user' | 'organization') ?? undefined;
				},
			},
		});
		if (response.redirect) {
			navigateTo(response.redirect);
		}
	} catch (error) {
		console.error(error);
	} finally {
		loading.value = false;
	}
}

/**
 * Composable for searching Github users
 * @returns {Object} The search composable object
 * @returns {Ref<GithubUser[]>} users - Array of Github users
 * @returns {Ref<boolean>} isLoading - Loading state indicator
 * @returns {Ref<string>} searchQuery - Current search query
 * @returns {(query: string) => void} search - Function to perform the search
 */
function useGithubSearch() {
	const users = ref<Partial<GithubUser>[]>([]);
	const isLoading = ref(false);
	const searchQuery = ref('');

	const debouncedSearch = useDebounceFn(async (query: string) => {
		if (!query || query.length === 0) {
			users.value = [];
			return;
		}

		isLoading.value = true;
		try {
			const response = await $fetch<SearchResponse>(`/api/search?q=${query}`);
			users.value = response.users.map((user) => ({
				label: user.login,
				avatar: {
					src: user.avatar_url,
				},
				...user,
			}));
		} finally {
			isLoading.value = false;
		}
	}, 250);

	return {
		users,
		isLoading,
		searchQuery,
		search: debouncedSearch,
	};
}

const { users, isLoading, searchQuery, search } = useGithubSearch();

/**
 * Handles the selection of a user from the select menu
 */
function handleUserSelection(item: Partial<GithubUser> | null) {
	username.value = typeof item === 'string' ? item : (item?.login ?? '');

	if (item && typeof item === 'object') {
		profileType.value = item.type as GithubProfileType;
	}
}

/**
 * Handles the search term updates
 */
function handleSearchTermUpdate(term: any) {
	if (term !== username.value) {
		search(term);
	}
}

// Copy for the form based on the mode (self or friend)
const copy = {
	help: `
		<p class="font-bold text-red-600">Salty Open Source Santa is a fun way to see if you've been a good open source contributor this year.</p>
		<ol>
			<li>Login to your GitHub account and write your letter to Santa.</li>
			<li>Santa will:
			<ul>
				<li>read your letter</li>
			<li>analyze your public GitHub activity</li>
				<li>decide if you've been naughty or nice</li>
				<li>and send you a letter back.</li>
			</ul>
			<li>Prepare yourself for a snarkyletter back.</li>
		</ol>
		<p><em>If you'd like to roast a friend or organization, toggle Friend Mode and enter their GitHub username instead.</em></p>
		<p class="font-bold">Concerned about privacy?</p>
		<ul>
			<li>Letters are publicly visible on your profile page by default, but you can opt out after generating your letter.</li>
			<li>Santa doesn't look up or store any private Github data, only publicly available information.</li>
		</ul>
	`,
	self: {
		title: 'Write your letter to Open Source Santa! 📝',
		description: `Are you on the open source naughty or nice list? Write your letter to Santa below to find out if you're on his good side.`,
		formUsername: 'My GitHub username is',
		formUsernamePlaceholder: 'Enter your GitHub username',
		formWishList: 'and I would love to receive',
		formWishListPlaceholder: "Tell Santa what coding gifts you'd like...",
	},
	friend: {
		title: 'Write your letter to a friend! 📝',
		description: `Is your friend on the open source naughty or nice list? Write Santa a letter to find out if they're on his good side.`,
		formUsername: 'Their GitHub username is',
		formUsernamePlaceholder: 'Enter their GitHub username',
		formWishList: 'and I want Santa to give them',
		formWishListPlaceholder: "Tell Santa what coding gifts you'd like your friend to receive...",
		formYourUsernamePlaceholder: 'Enter your name',
	},
};
</script>

<template>
	<div class="">
		<UContainer class="py-8 md:py-16">
			<div class="text-center mb-8">
				<BaseHeadline content="Salty Open Source Santa" size="xl" shadow />
				<BaseText as="p" size="md" class="mx-auto max-w-md text-red-200 mt-4">
					{{ copy[mode].description }}
				</BaseText>
				<div class="flex flex-col gap-4 md:flex-row justify-center items-center mt-4">
					<UDrawer :overlay="false">
						<UButton variant="soft" color="neutral">How does this work?</UButton>
						<template #content>
							<UContainer>
								<div v-html="copy.help" class="prose py-8 max-h-[400px] md:max-h-[80vh] overflow-y-auto"></div>
							</UContainer>
						</template>
					</UDrawer>
					<UButton
						to="https://docs.directus.io/blog/ai-santa-roast-app-with-directus-nuxt"
						target="_blank"
						variant="soft"
						color="neutral"
					>
						How's it built?
					</UButton>
				</div>
			</div>

			<div class="relative max-w-2xl mx-auto">
				<NotebookPaper>
					<UForm
						:state="{
							username,
							wishlist,
							profileType,
						}"
						class="relative flex flex-col gap-4 border-4 rounded-2xl border-transparent px-8 py-12"
						@submit="handleSubmit"
					>
						<UFormField label="Friend Mode" size="xl" class="absolute top-0 right-0 flex items-center gap-4">
							<USwitch
								:modelValue="isFriendMode"
								@update:modelValue="updateQuery('mode', $event ? 'friend' : undefined)"
							/>
						</UFormField>
						<div class="text-2xl md:text-3xl font-bold text-gray-900 mb-4 font-cursive">Dear Open Source Santa,</div>
						<div class="gap-2" v-auto-animate>
							<p class="text-gray-900 text-2xl font-bold font-cursive">{{ copy[mode].formUsername }}</p>
							<UButton
								v-if="!isFriendMode && !loggedIn"
								color="neutral"
								leading-icon="i-mdi-github"
								size="xl"
								block
								class="mt-2"
								:to="`${url}/auth/github`"
							>
								Sign in with Github
							</UButton>
							<User
								class="mt-2"
								v-else-if="loggedIn && !isFriendMode"
								:avatar="user?.avatar_url ?? ''"
								:username="user?.login ?? ''"
							/>
							<UFormField v-else block size="xl" class="flex-1 mt-2">
								<!-- @ts-ignore // TODO: Weirdness going on with USelectMenu and types-->
								<USelectMenu
									:model-value="username as any"
									@update:model-value="handleUserSelection"
									@update:search-term="handleSearchTermUpdate"
									:items="users || []"
									class="border-red-200 focus:border-green-500 w-full"
									:placeholder="copy[mode].formUsernamePlaceholder"
									variant="soft"
									:avatar="{ src: avatarUrl }"
								>
									<template #trailing>
										<UButton v-if="username" variant="ghost" @click="username = ''" icon="i-mdi-close" />
									</template>
								</USelectMenu>
							</UFormField>
							<BaseText
								v-if="isFriendMode && profileType === 'Organization'"
								size="sm"
								class="font-bold mt-2 font-mono"
							>
								Ooohh... You're roasting an organization! That's spicy! 🌶️
							</BaseText>
						</div>

						<div class="items-start gap-2">
							<p class="text-gray-900 font-bold text-2xl font-cursive mt-2">{{ copy[mode].formWishList }}</p>
							<UFormField block size="xl" class="flex-1 mt-2">
								<UTextarea
									v-model="wishlist"
									class="border-red-200 focus:border-green-500 w-full"
									:placeholder="copy[mode].formWishListPlaceholder"
									variant="soft"
									autoresize
								/>
							</UFormField>
							<p class="text-gray-900 font-bold text-2xl font-cursive mt-2">for Christmas this year! 🎁</p>
						</div>

						<div class="flex flex-col items-end" v-auto-animate>
							<p class="text-gray-900 text-right font-bold italic font-cursive text-2xl">Love from,</p>
							<template v-if="loggedIn">
								<p class="text-gray-900 text-right font-bold italic font-cursive text-2xl">{{ user?.login }}</p>
							</template>
							<template v-else-if="!loggedIn && isFriendMode">
								<UButton
									color="neutral"
									leading-icon="i-mdi-github"
									size="xl"
									class="justify-end text-right mt-2"
									:to="`${url}/auth/github`"
								>
									Sign in with Github
								</UButton>
							</template>
						</div>

						<UButton
							type="submit"
							:disabled="!canSubmit"
							:loading="loading"
							class="w-full bg-green-600 hover:bg-green-700 text-white"
							size="xl"
						>
							<span class="flex w-full items-center justify-center gap-2">
								<span v-if="!loading">Send to Santa</span>
								<span v-else>Checking twice...</span>
								🎄
							</span>
						</UButton>
						<UAlert
							v-if="!loggedIn"
							icon="lucide:info"
							title="You have to log in with GitHub before you can send your letter to Santa."
							variant="soft"
							color="error"
						/>
					</UForm>
					<p class="max-w-sm text-balance mt-4 text-gray-900 text-center text-sm mx-auto font-mono font-bold">
						Note: Santa doesn't store any of your private Github data in his database. He just needs to verify your
						identity.
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
