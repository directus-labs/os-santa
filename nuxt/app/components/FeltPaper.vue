<script setup lang="ts">
defineSlots<{
	default: () => any;
}>();

defineProps<{
	color?: 'red' | 'green' | 'cream';
	compact?: boolean;
}>();
</script>

<template>
	<div class="felt-container relative">
		<!-- Felt background with texture -->
		<div
			class="felt-bg absolute inset-0 rounded-2xl"
			:class="[color === 'green' ? 'bg-emerald-700' : color === 'cream' ? 'bg-amber-50' : 'bg-neutral-50']"
		>
			<!-- Felt texture overlay -->
			<div class="absolute inset-0 felt-texture rounded-2xl"></div>
		</div>

		<!-- Simple stitched border -->
		<div
			class="absolute inset-3 rounded-xl stitched-border"
			:class="[
				color === 'green' ? 'border-emerald-300/50' : color === 'cream' ? 'border-amber-700/30' : 'border-red-300/50',
			]"
		></div>

		<!-- Content -->
		<div class="relative" :class="[compact ? 'p-4' : 'p-6 md:p-8']">
			<slot />
		</div>
	</div>
</template>

<style scoped>
.felt-container {
	filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.2));
}

.stitched-border {
	border: 2px dashed currentColor;
}
</style>
