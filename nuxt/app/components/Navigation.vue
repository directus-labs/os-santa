<script setup lang="ts">
// @ts-ignore Missing types
import { useSound } from '@vueuse/sound';

import popOn from '~/assets/audio/pop-on.mp3';

interface NavigationItem {
	name: string;
	path: string;
	icon: string;
	isPrimary?: boolean;
}

const navigation: NavigationItem[] = [{ name: 'Create a Carol', path: '/', icon: 'lucide:music', isPrimary: true }];

const soundOn: Ref<boolean> = useCookie('soundOn', { default: () => true });
const { play: playOn } = useSound(popOn, { interrupt: true });

const showHelpModal = useState('showHelpModal', () => false);

function toggleSound() {
	soundOn.value = !soundOn.value;
	if (soundOn.value) playOn();
}
</script>

<template>
	<!-- Desktop Navigation -->
	<nav
		class="z-50 bg-sky-600/70 backdrop-blur-sm border-b border-white/10 py-1.5 md:sticky md:top-0 md:border-b md:border-t-0 fixed bottom-0 left-0 right-0 border-t md:py-0"
	>
		<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
			<div class="flex justify-between items-center h-16">
				<!-- Logo -->
				<NuxtLink to="/" class="text-white font-serif text-2xl font-bold hidden md:block">
					The Merry Carol Machine
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

					<!-- Help Toggle -->
					<button
						@click="showHelpModal = true"
						class="flex flex-col items-center text-white/80 hover:text-white px-3 py-1 transition-colors"
					>
						<UIcon :name="showHelpModal ? 'lucide:circle-x' : 'lucide:circle-help'" class="h-5 md:h-6 w-5 md:w-6" />
						<span class="text-xs mt-1">Help</span>
					</button>

					<!-- Sound Toggle -->
					<button
						@click="toggleSound"
						class="flex flex-col items-center text-white/80 hover:text-white px-3 py-1 transition-colors"
					>
						<UIcon :name="soundOn ? 'lucide:volume-2' : 'lucide:volume-x'" class="h-5 md:h-6 w-5 md:w-6" />
						<span class="text-xs mt-1">Sound</span>
					</button>
				</div>
			</div>
		</div>
	</nav>
</template>
