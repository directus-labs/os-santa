<script setup lang="ts">
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

const audioRef = ref<HTMLAudioElement | null>(null);
const isPlaying = ref(false);
const hasError = ref(false);
const errorMessage = ref('');
const playbackSpeed = ref(1);
const currentTime = ref(0);
const duration = ref(0);
const words = ref<Word[]>([]);
const soundOn: Ref<boolean> = useCookie('soundOn', { default: () => true });

function setupAudio() {
	if (!props.audioUrl) return;

	audioRef.value = new Audio(props.audioUrl);
	audioRef.value.playbackRate = playbackSpeed.value;

	audioRef.value.addEventListener('timeupdate', () => {
		if (audioRef.value) {
			currentTime.value = audioRef.value.currentTime;
		}
	});

	audioRef.value.addEventListener('loadedmetadata', () => {
		if (audioRef.value) {
			duration.value = audioRef.value.duration;
		}
	});

	audioRef.value.addEventListener('play', () => {
		isPlaying.value = true;
	});

	audioRef.value.addEventListener('pause', () => {
		isPlaying.value = false;
	});

	audioRef.value.addEventListener('ended', () => {
		isPlaying.value = false;
		currentTime.value = 0;
	});

	audioRef.value.addEventListener('error', () => {
		hasError.value = true;
		errorMessage.value = 'Error loading audio';
	});
}

function togglePlay() {
	if (!audioRef.value) return;

	if (isPlaying.value) {
		audioRef.value.pause();
	} else {
		audioRef.value.play();
	}
}

// Update progress bar
function updateProgress(value: number) {
	if (!audioRef.value) return;
	audioRef.value.currentTime = (value / 100) * duration.value;
}

const progress = computed(() => {
	if (!duration.value) return 0;
	return (currentTime.value / duration.value) * 100;
});

// Cleanup on component unmount
onUnmounted(() => {
	if (audioRef.value) {
		audioRef.value.pause();
		audioRef.value.src = '';
		audioRef.value.remove();
	}
});

// Initialize
onMounted(() => {
	setupAudio();
	preprocessText();
});

// Handle speed changes
watch(playbackSpeed, () => {
	if (audioRef.value) {
		audioRef.value.playbackRate = playbackSpeed.value;
	}
});

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
</script>

<template>
	<div class="relative h-full">
		<div class="sticky top-0 md:top-20 z-50">
			<div v-if="hasError" class="text-red-500 mb-2 px-4">
				{{ errorMessage }}
			</div>

			<div
				class="relative p-4 border-b-4 border-red-900/10 flex flex-col md:flex-row md:justify-between md:items-end gap-4"
			>
				<div class="relative flex-shrink-0">
					<img src="/images/bunny.svg" class="h-32 w-auto" />
					<p
						class="absolute w-80 top-0 left-16 border-2 border-gray-800 px-4 py-2 rounded-full bg-white after:content-[''] after:absolute after:border-[10px] after:border-transparent after:border-t-gray-800 after:-bottom-[20px] after:left-4 after:-translate-x-[50%] after:border-l-gray-800 after:rotate-12"
					>
						Want Santa to read your letter to you?
					</p>
				</div>

				<div class="w-full md:w-auto">
					<div class="flex w-full items-center gap-4">
						<button
							@click="togglePlay"
							:disabled="hasError"
							class="flex flex-shrink-0 items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<span class="sr-only">{{ isPlaying ? 'Pause' : 'Play' }}</span>
							<UIcon :name="isPlaying ? 'lucide:pause' : 'lucide:play'" class="w-5 h-5 md:w-6 md:h-6" />
						</button>
						<input
							type="range"
							:value="progress"
							@input="updateProgress(+$event.target.value)"
							class="flex-1 w-full h-3 md:h-4 bg-red-200 rounded-lg appearance-none cursor-pointer"
							min="0"
							max="100"
							step="0.1"
						/>
					</div>
				</div>

				<!-- Eleven Labs attribution - adjusted for mobile -->
				<div class="flex justify-end md:block">
					<span class="font-mono text-xs md:text-sm text-gray-700">Powered by</span>
					<a
						href="https://elevenlabs.io?ref=os-santa"
						target="_blank"
						class="opacity-75 hover:opacity-100 transition duration-150 ml-2"
					>
						<img src="/images/elevenlabs-logo-black.png" class="h-3 md:h-4 mt-1" />
					</a>
				</div>
			</div>
		</div>

		<!-- Text Content -->
		<div class="relative z-10 mt-8 prose text-2xl text-gray-900 md:text-3xl font-cursive">
			<div class="">
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
	</div>
</template>

<style scoped>
.prose {
	max-width: 100%;
	padding: 0 1rem;
}

/* Style the range input thumb (knob) */
input[type='range']::-webkit-slider-thumb {
	-webkit-appearance: none;
	appearance: none;
	width: 20px;
	height: 20px;
	background: #dc2626; /* red-600 to match your play button */
	border-radius: 50%;
	cursor: pointer;
	border: none;
}

/* Firefox */
input[type='range']::-moz-range-thumb {
	width: 20px;
	height: 20px;
	background: #dc2626;
	border-radius: 50%;
	cursor: pointer;
	border: none;
}

/* Optional: Add hover state */
input[type='range']::-webkit-slider-thumb:hover {
	background: #b91c1c; /* red-700 */
}

input[type='range']::-moz-range-thumb:hover {
	background: #b91c1c;
}
</style>
