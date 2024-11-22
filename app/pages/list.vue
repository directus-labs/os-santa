<script setup lang="ts">
interface Profile {
	username: string;
	list: 'naughty' | 'nice';
	letter: string;
	type: 'user' | 'organization';
	meta?: {
		totalLikes: number;
		userLikeCount: number;
	};
}

const route = useRoute();

const { data: profiles, refresh } = await useAsyncData('profiles', () =>
	$fetch('/api/profiles', {
		method: 'GET',
		params: {
			list: (route.query.list as string),
			q: (route.query.q as string),
			type: (route.query.type as string),
		},
	}),
);

const { updateQuery, debouncedUpdateQuery } = useQueryParams({
	callback: () => {
		refresh();
	},
});

const filterTypes = [
	{
		label: 'All',
		value: null,
	},
	{
		label: 'User',
		value: 'user',
	},
	{
		label: 'Organization',
		value: 'organization',
	},
];

// Computed properties for filtered lists
const naughtyProfiles = computed(() => profiles.value?.filter((profile) => profile.list === 'naughty') || []);

const niceProfiles = computed(() => profiles.value?.filter((profile) => profile.list === 'nice') || []);
</script>

<template>
	<div class="">
		<UContainer class="py-6 sm:py-12">
			<!-- Santa's List Paper Effect -->
			<div class="max-w-5xl mx-auto px-4 sm:px-6">
				<div class="bg-[#f7e9d3] rounded-lg shadow-xl p-4 sm:p-8 relative border-8 border-double border-[#d4b995]">
					<div class="space-y-4 text-center">
						<BaseHeadline content="Open Source Santa's List" color="secondary" />
						<BaseText class="">See who's been naughty or nice in the open source community this year.</BaseText>
					</div>

					<!-- Search Bar -->
					<div class="pb-6 flex w-full justify-between items-end gap-4 border-b border-[#d4b995] pt-4">
						<UInput
							:modelValue="route.query.q"
							@update:modelValue="debouncedUpdateQuery('q', $event ?? undefined)"
							type="search"
							placeholder="Search developers..."
						icon="lucide:search"
							variant="none"
							class="rounded-full border-2 border-[#d4b995] bg-[#f0e0c6] focus-within:outline-none focus-within:border-red-800 focus-within:ring focus-within:ring-red-600 focus-within:ring-opacity-50"
							:ui="{
								leadingIcon: 'text-[#d4b995]',
								trailingIcon: 'text-[#d4b995]',
							}"
						/>

						<USelectMenu
							icon="lucide:filter"
							:modelValue="route.query.type"
							@update:modelValue="updateQuery('type', $event.value ?? undefined)"
							:items="filterTypes"
							color="neutral"
							variant="none"
							class="min-w-36 rounded-full border-2 border-[#d4b995] bg-[#f0e0c6] focus-within:outline-none focus-within:border-red-800 focus-within:ring focus-within:ring-red-600 focus-within:ring-opacity-50"
							:ui="{
								leadingIcon: 'text-[#d4b995]',
								trailingIcon: 'text-[#d4b995]',
							}"
						/>
					</div>

					<!-- Lists Container -->
					<div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
						<ProfileList title="Naughty List" :profiles="naughtyProfiles" type="naughty" />
						<ProfileList title="Nice List" :profiles="niceProfiles" type="nice" />
					</div>
				</div>
			</div>
		</UContainer>
	</div>
</template>

<style scoped>
.text-shadow {
	text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}
</style>
