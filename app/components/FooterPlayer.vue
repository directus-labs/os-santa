<script setup lang="ts">
const audio = ref<HTMLAudioElement | null>(null);
const isPlaying = ref(false);
const progress = ref(0);

function togglePlay() {
	if (!audio.value) return;

	if (isPlaying.value) {
		audio.value.pause();
	} else {
		audio.value.play();
	}

	isPlaying.value = !isPlaying.value;
}

function updateProgress() {
	if (!audio.value) return;
	progress.value = (audio.value.currentTime / audio.value.duration) * 100;
}

onMounted(() => {
	if (audio.value) {
		audio.value.addEventListener('timeupdate', updateProgress);
	}
});

onUnmounted(() => {
	if (audio.value) {
		audio.value.removeEventListener('timeupdate', updateProgress);
	}
});
</script>

<template>
	<footer class="fixed bottom-0 left-0 right-0 bg-white border-t border-red-100 shadow-lg">
		<div class="container mx-auto px-4 py-2">
			<div class="relative flex items-center gap-4">
				<!-- Santa Image -->
				<div class="absolute left-0 -top-24">
					<!-- <img src="/images/santa.svg" alt="Santa" class="w-32" /> -->
				</div>

				<!-- Audio Player -->
				<div class="flex-1 pl-32">
					<div class="flex items-center gap-4">
						<button
							class="w-10 h-10 flex items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
							@click="togglePlay"
						>
							<Icon :name="isPlaying ? 'material-symbols:pause' : 'material-symbols:play-arrow'" class="w-6 h-6" />
						</button>

						<div class="flex-1">
							<div class="h-2 bg-red-100 rounded-full overflow-hidden">
								<div class="h-full bg-red-600 transition-all duration-300" :style="{ width: `${progress}%` }" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<audio ref="audio" src="/audio/fork-around.mp3" preload="metadata" />
	</footer>
</template>
