<script setup lang="ts">
interface Props {
	/**
	 * Base filename without extension (e.g., "my-animation")
	 * Component expects both my-animation.mov and my-animation.webm in /public/videos/
	 */
	src: string;
	/**
	 * Alt text for accessibility
	 */
	alt?: string;
	/**
	 * Whether the video should autoplay
	 * @default true
	 */
	autoplay?: boolean;
	/**
	 * Whether the video should loop
	 * @default true
	 */
	loop?: boolean;
	/**
	 * Whether the video should be muted (required for autoplay in most browsers)
	 * @default true
	 */
	muted?: boolean;
	/**
	 * Width of the video
	 */
	width?: string | number;
	/**
	 * Height of the video
	 */
	height?: string | number;
	/**
	 * Additional CSS classes
	 */
	class?: string;
	/**
	 * Whether to show playback controls
	 * @default false
	 */
	controls?: boolean;
	/**
	 * Loading behavior for the video
	 * @default 'lazy'
	 */
	loading?: 'eager' | 'lazy';
}

const props = withDefaults(defineProps<Props>(), {
	alt: 'Transparent video',
	autoplay: true,
	loop: true,
	muted: true,
	controls: false,
	loading: 'lazy',
});

// Emit events
const emit = defineEmits<{
	play: [];
	pause: [];
	ended: [];
	error: [error: Event];
}>();
// Construct video paths
const hevcPath = `/videos/${props.src}.mov`;
const webmPath = `/videos/${props.src}.webm`;

// Video element ref
const videoRef = ref<HTMLVideoElement | null>(null);

// Event handlers
const handlePlay = () => emit('play');
const handlePause = () => emit('pause');
const handleEnded = () => emit('ended');
const handleError = (e: Event) => emit('error', e);

// Public methods exposed via template ref
defineExpose({
	play: () => videoRef.value?.play(),
	pause: () => videoRef.value?.pause(),
	seek: (time: number) => {
		if (videoRef.value) {
			videoRef.value.currentTime = time;
		}
	},
});
</script>

<template>
	<video
		ref="videoRef"
		:class="props.class"
		:width="width"
		:height="height"
		:autoplay="autoplay"
		:loop="loop"
		:muted="muted"
		:controls="controls"
		playsinline
		:aria-label="alt"
		:loading="loading"
		@play="handlePlay"
		@pause="handlePause"
		@ended="handleEnded"
		@error="handleError"
	>
		<!-- HEVC must come first for Safari (it supports VP9 but not VP9 with alpha) -->
		<source :src="hevcPath" type="video/mp4; codecs=&quot;hvc1&quot;">
		<source :src="webmPath" type="video/webm">

		<!-- Fallback message -->
		<p>{{ alt }}</p>
	</video>
</template>

<style scoped>
video {
	/* Ensure transparency works properly */
	background: transparent;
	display: block;
}
</style>
