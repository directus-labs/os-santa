<script setup lang="ts">
const props = withDefaults(
	defineProps<{
		avatar: string;
		username: string;
		script?: string;
		size?: 'sm' | 'md' | 'lg';
	}>(),
	{
		size: 'md',
	},
);
</script>
<template>
	<div class="flex items-center gap-2">
		<UAvatar :src="avatar" :size="size" class="ring ring-red-600" />
		<p class="font-mono font-bold" :class="script ? 'font-cursive text-2xl' : ''">{{ username }}</p>
	</div>
</template>

<style scoped></style>
