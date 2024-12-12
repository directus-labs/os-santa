<script setup lang="ts">
import { useSound } from '@vueuse/sound';

interface Word {
	text: string;
	start: number;
	end: number;
	isWhitespace: boolean;
}

interface Props {
	letterContent: string;
	letterVoiceoverMetadata?: {
		alignment: {
			characters: string[];
			character_start_times_seconds: number[];
			character_end_times_seconds: number[];
		};
	};
	audioUrl?: string;
}

const props = defineProps<Props>();

const isPlaying = ref(false);
const hasError = ref(false);
const errorMessage = ref('');
const playbackSpeed = ref(1);
const currentTime = ref(0);
const words = ref<Word[]>([]);

// Sound handling with better error management
const { play, pause, sound } = useSound(props.audioUrl || '', {
	onload: () => {
		console.log('Audio loaded successfully');
		hasError.value = false;
		errorMessage.value = '';
	},
	onloaderror: (_, err) => {
		hasError.value = true;
		errorMessage.value = 'Error loading audio';
		console.error('Audio loading error:', err);
	},
	onplay: () => {
		isPlaying.value = true;
		startTimeTracking();
	},
	onpause: () => {
		isPlaying.value = false;
		stopTimeTracking();
	},
	onend: () => {
		isPlaying.value = false;
		currentTime.value = 0;
		stopTimeTracking();
	},
});

// Time tracking for more accurate highlighting
let timeTracker: number;

function startTimeTracking() {
	timeTracker = window.setInterval(() => {
		if (sound.value) {
			currentTime.value = sound.value.seek();
		}
	}, 10); // Update every 10ms for smooth tracking
}

function stopTimeTracking() {
	if (timeTracker) {
		window.clearInterval(timeTracker);
	}
}

function preprocessText() {
	if (!props.letterVoiceoverMetadata) {
		words.value = [
			{
				text: props.letterContent,
				start: 0,
				end: Infinity,
				isWhitespace: false,
			},
		];
		return;
	}

	const { alignment } = props.letterVoiceoverMetadata;
	const result: (Word & { isWhitespace: boolean })[] = [];
	let currentWord = '';
	let wordStart = 0;
	let lastEnd = 0;

	alignment.characters.forEach((char, index) => {
		const start = alignment.character_start_times_seconds[index];
		const end = alignment.character_end_times_seconds[index];

		if (/[\s\n]/.test(char)) {
			if (currentWord) {
				result.push({
					text: currentWord,
					start: wordStart,
					end: lastEnd,
					isWhitespace: false,
				});
				currentWord = '';
			}
			result.push({
				text: char,
				start,
				end,
				isWhitespace: true,
			});
		} else if (/[.,!?"]/.test(char)) {
			if (currentWord) {
				result.push({
					text: currentWord,
					start: wordStart,
					end: lastEnd,
					isWhitespace: false,
				});
				currentWord = '';
			}
			result.push({
				text: char,
				start,
				end,
				isWhitespace: false,
			});
		} else {
			if (!currentWord) {
				wordStart = start;
			}
			currentWord += char;
			lastEnd = end;
		}
	});

	if (currentWord) {
		result.push({
			text: currentWord,
			start: wordStart,
			end: alignment.character_end_times_seconds[alignment.characters.length - 1],
			isWhitespace: false,
		});
	}

	words.value = result;
}

const activeWords = computed(() => {
	const time = currentTime.value;
	return words.value.map((word, index) => ({
		...word,
		isActive: time >= word.start / playbackSpeed.value && time <= word.end / playbackSpeed.value,
		key: `word-${index}-${word.text}`,
	}));
});

function togglePlay() {
	if (isPlaying.value) {
		pause();
	} else {
		play();
	}
}

// Initialize
onMounted(() => {
	preprocessText();
	if (sound.value) {
		sound.value.rate(playbackSpeed.value);
	}
});

// Handle speed changes
watch(playbackSpeed, () => {
	if (sound.value) {
		sound.value.rate(playbackSpeed.value);
	}
});
</script>

<template>
	<div>
		<!-- Audio Controls -->
		<div class="mb-6">
			<div v-if="hasError" class="text-red-500 mb-2">
				{{ errorMessage }}
			</div>

			<div class="relative p-4 border-2 border-red-900/20 border-dashed rounded-lg">
				<p class="font-mono">Want Santa to read your letter to you?</p>
				<button
					@click="togglePlay"
					:disabled="hasError"
					class="flex items-center justify-center w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed mt-4"
				>
					<span class="sr-only">{{ isPlaying ? 'Pause' : 'Play' }}</span>
					<UIcon :name="isPlaying ? 'lucide:pause' : 'lucide:play'" class="w-6 h-6" />
				</button>
				<div class="absolute bottom-4 right-4 gap-4">
					<span class="font-mono">Powered by</span>
					<img src="/images/elevenlabs-logo-black.png" class="h-4" />
				</div>
			</div>

			<div class="flex items-center gap-4"></div>
		</div>

		<!-- Text Content -->
		<div class="relative z-10 mt-8 md:mt-0 prose text-2xl text-gray-900 md:text-3xl font-cursive">
			<template v-for="word in activeWords" :key="word.key">
				<span
					:class="{
						'bg-red-500/30 rounded-lg transition-colors duration-200': !word.isWhitespace && word.isActive,
						'whitespace-pre': word.isWhitespace,
					}"
				>
					{{ word.text }}
				</span>
			</template>
		</div>
	</div>
</template>

<style scoped>
.prose {
	max-width: 65ch;
}
</style>
