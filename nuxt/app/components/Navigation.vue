<script setup lang="ts">
//@ts-ignore Missing types
import { useSound } from '@vueuse/sound';

import popOn from '~/assets/audio/pop-on.mp3';

const soundOn: Ref<boolean> = useCookie('soundOn', {
	default: () => true,
});

const { loggedIn, user, clear } = useUserSession();

const { play: playOn } = useSound(popOn, {
	interrupt: true,
});

// Toggle sound function
function toggleSound() {
	soundOn.value = !soundOn.value;
	soundOn.value ? playOn() : null;
}

const routes = [{ name: "Santa's List", path: '/list' }];
</script>

<template>
	<nav class="sticky top-0 z-50 bg-white/10 backdrop-blur-sm border-b border-white/10">
		<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center h-16">
				<!-- Logo and Navigation Links -->
				<div class="flex items-center space-x-8">
					<NuxtLink to="/" class="text-white font-serif text-2xl font-bold">Salty Open Source Santa</NuxtLink>
				</div>

				<div class="items-center gap-4 hidden md:flex">
					<NuxtLink
						v-for="route in routes"
						:key="route.path"
						:to="route.path"
						class="text-white/80 hover:text-white px-3 py-1 rounded-md transition-colors"
						active-class="text-white bg-white/10"
					>
						{{ route.name }}
					</NuxtLink>
					<UButton to="/">Write A Letter</UButton>
					<UButton
						variant="outline"
						color="neutral"
						:icon="soundOn ? 'lucide:volume-2' : 'lucide:volume-x'"
						@click="toggleSound"
					/>
					<UDropdownMenu
						v-if="loggedIn"
						:items="[
							{ label: 'My Letter', icon: 'mdi:account', to: `/${user?.login}` },
							{ label: 'Logout', icon: 'mdi:logout', onSelect: clear },
						]"
					>
						<button type="button" class="flex items-center gap-2 ring-2 ring-white rounded-full bg-white">
							<UAvatar :src="user?.avatar_url" size="lg" />
						</button>
					</UDropdownMenu>
				</div>
			</div>
		</div>
	</nav>
</template>
