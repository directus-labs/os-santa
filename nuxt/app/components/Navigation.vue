<script setup lang="ts">
//@ts-ignore Missing types
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

const soundOn: Ref<boolean> = useCookie('soundOn', {
	default: () => true,
});

const { loggedIn, user, clear } = useUserSession();
const { play: playOn } = useSound(popOn, { interrupt: true });

function toggleSound() {
	soundOn.value = !soundOn.value;
	soundOn.value ? playOn() : null;
}

// User menu items
const userMenuItems = computed(() => [
	{ label: 'My Letter', icon: 'mdi:account', to: `/${user?.value?.login}` },
	{ label: 'Logout', icon: 'mdi:logout', onSelect: clear },
]);
</script>

<template>
	<!-- Desktop Navigation -->
	<nav class="sticky top-0 z-50 bg-white/10 backdrop-blur-sm border-b border-white/10 hidden md:block">
		<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center h-16">
				<!-- Logo -->
				<div class="flex items-center space-x-8">
					<NuxtLink to="/" class="text-white font-serif text-2xl font-bold">Salty Open Source Santa</NuxtLink>
				</div>

				<div class="items-center gap-4 hidden md:flex">
					<template v-for="item in navigation" :key="item.path">
						<UButton
							:to="item.path"
							:color="item.isPrimary ? 'primary' : 'neutral'"
							:variant="item.isPrimary ? 'solid' : 'link'"
							:class="item.isPrimary ? 'text-white' : 'text-white/80'"
						>
							{{ item.name }}
						</UButton>
					</template>

					<UButton
						variant="outline"
						color="neutral"
						:icon="soundOn ? 'lucide:volume-2' : 'lucide:volume-x'"
						@click="toggleSound"
					/>
					<UDropdownMenu v-if="loggedIn" :items="userMenuItems">
						<button type="button" class="flex items-center gap-2 ring-2 ring-white rounded-full bg-white">
							<UAvatar :src="user?.avatar_url" size="lg" />
						</button>
					</UDropdownMenu>
				</div>
			</div>
		</div>
	</nav>

	<!-- Mobile Navigation -->
	<nav class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-red-700/50 backdrop-blur-sm border-t border-white/10">
		<div class="max-w-6xl mx-auto px-4">
			<div class="grid grid-cols-4 items-center h-16">
				<NuxtLink
					v-for="item in navigation"
					:key="item.path"
					:to="item.path"
					class="flex flex-col items-center text-white/80 hover:text-white px-3 py-1 transition-colors text-center"
					active-class="text-white"
				>
					<UIcon :name="item.icon" class="h-6 w-6" />
					<span class="text-xs mt-1">{{ item.name }}</span>
				</NuxtLink>

				<button
					class="flex flex-col items-center text-white/80 hover:text-white px-3 py-1 transition-colors"
					@click="toggleSound"
				>
					<UIcon :name="soundOn ? 'lucide:volume-2' : 'lucide:volume-x'" class="h-6 w-6" />
					<span class="text-xs mt-1">Sound</span>
				</button>

				<UDropdownMenu v-if="loggedIn" :items="userMenuItems" placement="top">
					<button class="flex flex-col items-center">
						<UAvatar :src="user?.avatar_url" size="sm" />
						<span class="text-xs mt-1 text-white/80">Profile</span>
					</button>
				</UDropdownMenu>
			</div>
		</div>
	</nav>
</template>
