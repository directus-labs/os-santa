<script setup lang="ts">
import key from './.keys';

const props = defineProps<{ text?: string }>();

const path = inject(key);

const url = computed(
	() => `https://x.com/intent/tweet?url=${encodeURI(path?.value ?? '')}&text=${encodeURI(props.text ?? '')}`,
);
</script>

<template>
	<NuxtLink :to="url" target="_blank">
		<slot>
			<Icon name="fa6-brands:x-twitter" />
		</slot>
	</NuxtLink>
</template>
