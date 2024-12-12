<script setup lang="ts">
import { Vue3Marquee } from 'vue3-marquee';
import type { Profile } from '#shared/types/schema.js';
const props = defineProps<{ profiles: Partial<Profile>[] }>();
</script>

<template>
	<div>
		<Vue3Marquee :pause-on-hover="true" class="">
			<NuxtLink
				v-for="profile in profiles"
				:key="profile.username"
				:to="`/${profile.username}`"
				class="ml-8 text-white"
			>
				<User
					:username="profile.username"
					:avatar="`https://github.com/${profile.username}.png`"
					class="opacity-50 hover:opacity-100 transition duration-150"
				/>
			</NuxtLink>
		</Vue3Marquee>
	</div>
</template>

<style scoped></style>
