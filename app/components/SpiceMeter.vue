<script setup lang="ts">
import { useSound } from '@vueuse/sound';
import { useDebounceFn } from '@vueuse/core';

import shortSizzle from '~/assets/audio/slide-whistle.mp3';
import steamWhistle from '~/assets/audio/steam-whistle.mp3';
import downWhistle from '~/assets/audio/slide-whistle-down.mp3';

const soundOn = useCookie('soundOn');

const playbackRate = ref(0.8);

const { play: playUpWhistle } = useSound(shortSizzle, {
	playbackRate,
	interrupt: true,
});

const { play: playSteamWhistle } = useSound(steamWhistle, {
	playbackRate: 1,
	interrupt: true,
});

const { play: playDownWhistle } = useSound(downWhistle, {
	playbackRate,
	interrupt: true,
});

const MAX_LEVELS = 11;
const MIN_LEVEL = 0;

const SPICE_COLORS = [
	'#90EE90',
	'#ADFF2F',
	'#FFFF00',
	'#FFD700',
	'#FFA500',
	'#FF8C00',
	'#FF7F50',
	'#FF6347',
	'#FF4500',
	'#FF0000',
	'#8B0000',
] as const;

interface LikeResponse {
	success: boolean;
	count: number;
	previousCount: number;
	totalLikes: number;
}

const props = defineProps<{
	profile: string;
	userCount?: number;
	totalCount?: number;
}>();

const level = ref(Number(props.userCount) || MIN_LEVEL);
const totalLikes = ref(Number(props.totalCount) || 0);
playbackRate.value = 1 + level.value * 0.1;

// Debounced function to update likes
const updateLikes = useDebounceFn(async (newLevel: number, previousLevel: number) => {
	try {
		const { data } = await useFetch<LikeResponse>(`/api/${props.profile}/likes`, {
			method: 'POST',
			body: { count: newLevel },
		});

		if (!data.value?.success) {
			throw new Error('Failed to update spice level');
		}

		// Server confirmed the update, no need to do anything
		// as we've already updated optimistically
	} catch (error) {
		console.error('Failed to update spice level:', error);
		// Revert both level and totalLikes on error
		level.value = previousLevel;
		totalLikes.value -= newLevel - previousLevel;
		playbackRate.value = 1 + previousLevel * 0.1;
		throw error;
	}
}, 500);

const showChange = ref(false);
const lastChange = ref(0);

function incrementLevel() {
	if (level.value < MAX_LEVELS) {
		const newLevel = Math.min(Number(level.value) + 1, MAX_LEVELS);
		const previousLevel = Number(level.value);
		const difference = newLevel - previousLevel;

		// Optimistically update both values
		level.value = newLevel;
		totalLikes.value += difference;
		playbackRate.value = 1 + newLevel * 0.1;
		showChangeIndicator(1);

		if (level.value === MAX_LEVELS) {
			soundOn.value && playSteamWhistle();
		} else {
			soundOn.value && playUpWhistle();
		}

		// Pass both values to updateLikes for proper error handling
		updateLikes(newLevel, previousLevel);
	} else {
		showChangeIndicator('max');
	}
}

function decrementLevel() {
	if (level.value > MIN_LEVEL) {
		const newLevel = Math.max(Number(level.value) - 1, MIN_LEVEL);
		const previousLevel = Number(level.value);
		const difference = newLevel - previousLevel;

		// Optimistically update both values
		level.value = newLevel;
		totalLikes.value += difference; // This will subtract since difference is negative
		playbackRate.value = 1 + newLevel * 0.1;
		showChangeIndicator(-1);
		if (soundOn.value) {
			playDownWhistle();
		}

		// Pass both values to updateLikes for proper error handling
		updateLikes(newLevel, previousLevel);
	}
}

function showChangeIndicator(change: number | 'max') {
	lastChange.value = typeof change === 'number' ? change : 0;
	showChange.value = true;

	setTimeout(() => {
		showChange.value = false;
	}, 500);
}
</script>

<template>
	<div class="">
		<button
			class="w-full h-full transform hover:scale-105 transition duration-300 ease-in-out hover:bg-gray-900/10 rounded-full cursor-pointer"
			:aria-label="`Spice level: ${level + 1} out of ${MAX_LEVELS}. Click to increase, right click to decrease.`"
			@click="incrementLevel"
			@contextmenu.prevent="decrementLevel"
		>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" class="w-full h-full">
				<defs>
					<linearGradient id="pepperGradient" x1="0%" y1="100%" x2="0%" y2="0%">
						<stop
							v-for="(color, index) in SPICE_COLORS"
							:key="index"
							:offset="`${(index / MAX_LEVELS) * 100}%`"
							:stop-color="index <= level ? color : 'white'"
							:style="{
								transition: 'stop-color 0.3s ease-in-out',
							}"
						/>
					</linearGradient>
				</defs>
				<path
					d="M105.7624,45.4443c.557-7.3486-11.96-12.97-9.9019-16.0911,3.2725-4.9629,5.0629-21.0038,5.0629-21.0038l-8.49.5944s2.87,12.6029.1819,18.75c-1.6016,3.6623-9.7778-2.0444-18.8589,4.2719Z"
					fill="#4a995c"
				/>
				<path
					d="M95.8605,29.3531c3.2725-4.9628,5.0629-21.0037,5.0629-21.0037l-3.2776.2294a85.552,85.552,0,0,1-1.0744,9.814c-1.4464,8.6786-2.8928,10.125-2.8928,11.5715s-.6748,5.6044-.6748,5.6044,1.5661,2.83,3.4936,5.974l9.265,3.9016C106.3194,38.0956,93.8027,32.4739,95.8605,29.3531Z"
					fill="#3f824b"
				/>
				<path
					d="M73.5874,32.2623c-3.2837,7.9648-8.09,33.2317-17.2148,50.2685s-22.3448,28.084-32.4585,21.5786c-8.0147-5.1552-5.151-23.0672-5.151-23.0672-5.667,6.1394-5.6,16.6961-3.6724,23.2552,3.62,12.32,19.3511,18.7366,32.8052,14.1829,13.2024-4.4685,28.6482-19.4162,38.5286-34.4054,8.5864-13.0261,17.3632-31.88,19.3379-38.6306C105.67,39.8888,81.14,28.4229,73.5874,32.2623Z"
					fill="url(#pepperGradient)"
					class="transition-all duration-300"
				/>
				<path
					d="M93.0038,35.5687C88.9293,47.7173,75.4545,83.9365,54.4119,101.472c-18.0494,15.0412-28.78,11.4467-35.3211,2.9435s-.3277-23.3733-.3277-23.3733c-5.667,6.1394-5.6,16.6961-3.6725,23.2552,3.62,12.32,19.3512,18.7365,32.8053,14.1828,13.2024-4.4685,28.6482-19.4161,38.5285-34.4053,8.5865-13.0261,17.3633-31.88,19.338-38.6306C105.7173,42.7366,99.8641,38.6281,93.0038,35.5687Z"
					fill="url(#pepperGradient)"
					class="transition-all duration-300"
				/>
				<path
					d="M19.1992,80.1426a.9994.9994,0,0,0-1.1709.2212c-5.74,6.2182-6.0439,16.9116-3.8965,24.2153a22.0172,22.0172,0,0,0,11.3506,13.148,29.62,29.62,0,0,0,22.7334,1.7006C62.5332,114.5815,78.1426,98.4565,87.26,84.625c8.7373-13.2549,17.5-32.1914,19.4629-38.9a.9863.9863,0,0,0,.0183-.1362c.0036-.0241.0169-.0442.0188-.0689.002-.0276,0-.0544.0015-.082l.0014-.01-.001-.01c.2783-4.5005-3.6019-8.2113-6.7275-11.1968-1.6914-1.6148-3.7959-3.6245-3.3389-4.3179,3.3662-5.1045,5.1485-20.7783,5.2227-21.4433a1.0009,1.0009,0,0,0-1.0645-1.1084l-8.4912.5947a1,1,0,0,0-.9043,1.22c.0274.1226,2.7686,12.3486.2412,18.127-.3613.8252-1.4892.8286-4.167.64-3.5146-.2505-8.8271-.6264-14.3476,3.2124a.9729.9729,0,0,0-.3357.4444,1.0078,1.0078,0,0,0-.1868.2915c-1.1094,2.6923-2.3418,7.146-3.9014,12.7841C65.7148,55.6772,61.543,70.7588,55.49,82.0586c-6.5361,12.2051-14.8125,20.626-22.1386,22.5259a10.82,10.82,0,0,1-8.8965-1.3159C17.084,98.5269,19.7227,81.3721,19.75,81.2A1,1,0,0,0,19.1992,80.1426ZM87.3906,29.9272c2.7754.1978,5.1787.3677,6.1407-1.8325,2.332-5.3325.7607-14.9272.1142-18.2334l6.1377-.43c-.4844,3.774-2.1572,15.4278-4.7578,19.3711-1.376,2.0874.9424,4.3013,3.6269,6.8653a38.7362,38.7362,0,0,1,4.053,4.294,35.9168,35.9168,0,0,0-3.2375-2.1783c-5.3366-3.2122-14.0552-6.8038-20.5706-7.2425A22.2981,22.2981,0,0,1,87.3906,29.9272ZM23.373,104.95a12.745,12.745,0,0,0,10.48,1.57c7.8574-2.0376,16.6045-10.83,23.4-23.5176,6.1572-11.4961,10.3633-26.7021,13.4346-37.8047,1.414-5.1113,2.6435-9.5571,3.6777-12.1943,4.666-1.9243,16.2744,1.8,24.07,6.4932,4.4541,2.6816,6.17,4.7832,6.3164,5.8364C102.7285,52.0718,94.1543,70.53,85.59,83.5244c-8.93,13.5459-24.1464,29.315-38.0146,34.0088a27.5862,27.5862,0,0,1-21.17-1.5806A20.0427,20.0427,0,0,1,16.05,104.0156c-1.6738-5.6977-1.78-13.5766,1.3213-19.2973C16.9893,90.457,17.2139,100.9888,23.373,104.95Z"
					fill="#000000"
				/>
			</svg>
		</button>
		<div class="relative flex justify-center items-center">
			<p class="font-mono font-bold text-white text-center text-2xl">
				{{ totalLikes }}
			</p>
			<Transition
				enter-active-class="transition duration-300 ease-in-out"
				enter-from-class="opacity-0 translate-y-0"
				enter-to-class="opacity-100 translate-y-[-1rem]"
				leave-active-class="transition duration-200 ease-in-out"
				leave-from-class="opacity-100 translate-y-[-1rem]"
				leave-to-class="opacity-0 translate-y-[-2rem]"
			>
				<p
					v-if="showChange"
					class="absolute right-0 font-mono text-white text-lg"
					:class="lastChange === 0 ? 'text-yellow-400' : lastChange > 0 ? 'text-green-400' : 'text-red-400'"
				>
					{{ lastChange === 0 ? 'MAX' : lastChange > 0 ? '+1' : '-1' }}
				</p>
			</Transition>
		</div>
	</div>
</template>

<style scoped></style>
