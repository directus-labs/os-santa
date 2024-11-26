<script setup lang="ts">
import { useSound } from '@vueuse/sound';
import popOn from '~/assets/audio/pop-on.mp3';

const soundOn = useCookie('soundOn', {
	default: () => true,
});

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
	<nav class="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-sm border-b border-white/10">
		<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center h-16">
				<!-- Logo and Navigation Links -->
				<div class="flex items-center space-x-8">
					<NuxtLink to="/" class="text-white font-serif text-2xl font-bold">Salty Open Source Santa</NuxtLink>
				</div>

				<div class="flex items-center space-x-4 hidden md:flex">
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
				</div>
			</div>
		</div>
	</nav>
</template>
