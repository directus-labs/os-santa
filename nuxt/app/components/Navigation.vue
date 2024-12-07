<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSound } from '@vueuse/sound';
import popOn from '~/assets/audio/pop-on.mp3';

interface NavigationItem {
	name: string;
	path: string;
	icon: string;
	isPrimary?: boolean;
}

const navigation: NavigationItem[] = [
	{ name: "Santa's List", path: '/list', icon: 'lucide:list' },
	{ name: 'Write A Letter', path: '/', icon: 'lucide:pen', isPrimary: true },
];

const soundOn = ref(true);
const { play: playOn } = useSound(popOn, { interrupt: true });

function toggleSound() {
	soundOn.value = !soundOn.value;
	if (soundOn.value) playOn();
}

const { loggedIn, user, clear } = useUserSession();

const userMenuItems = computed(() => [
	{ label: 'My Letter', icon: 'mdi:account', to: `/${user?.value?.login}` },
	{ label: 'Logout', icon: 'mdi:logout', onSelect: clear },
]);
</script>

<template>
	<!-- Desktop Navigation -->
	<nav
		class="z-50 bg-red-600/70 backdrop-blur-sm border-b border-white/10 py-1.5 md:sticky md:top-0 md:border-b md:border-t-0 fixed bottom-0 left-0 right-0 border-t md:py-0"
	>
		<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
			<div class="flex justify-between items-center h-16">
				<!-- Logo -->
				<NuxtLink to="/" class="text-white font-serif text-2xl font-bold hidden md:block">
					Salty Open Source Santa
				</NuxtLink>

				<!-- Navigation Items -->
				<div class="flex items-center justify-around gap-4 w-full md:w-auto">
					<template v-for="item in navigation" :key="item.path">
						<UButton
							:to="item.path"
							:color="item.isPrimary ? 'primary' : 'neutral'"
							:variant="item.isPrimary ? 'solid' : 'link'"
							:class="['text-white', item.isPrimary ? '' : 'text-white/80 hover:text-white', 'hidden md:block']"
							active-class="ring-2 ring-white"
						>
							{{ item.name }}
						</UButton>
						<NuxtLink
							:to="item.path"
							class="flex flex-col items-center text-white/80 hover:text-white px-3 py-1 transition-colors text-center md:hidden"
							active-class="text-white ring-2 ring-white/50"
						>
							<UIcon :name="item.icon" class="h-5 md:h-6 w-5 md:w-6" />
							<span class="text-xs mt-1">{{ item.name }}</span>
						</NuxtLink>
					</template>

					<!-- Sound Toggle -->
					<button
						@click="toggleSound"
						class="flex flex-col items-center text-white/80 hover:text-white px-3 py-1 transition-colors"
					>
						<UIcon :name="soundOn ? 'lucide:volume-2' : 'lucide:volume-x'" class="h-5 md:h-6 w-5 md:w-6" />
						<span class="text-xs mt-1">Sound</span>
					</button>

					<!-- User Menu -->
					<UDropdownMenu v-if="loggedIn" :items="userMenuItems">
						<button type="button" class="flex flex-col items-center gap-2 ring-2 ring-white rounded-full bg-white">
							<UAvatar :src="user?.avatar_url" size="lg" />
						</button>
					</UDropdownMenu>
				</div>
			</div>
		</div>
	</nav>
</template>
