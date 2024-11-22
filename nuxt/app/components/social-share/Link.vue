<script setup lang="ts">
import key from './.keys';
const toast = useToast();

const path = inject(key);

const { copy } = useClipboard({ source: path });

const handleCopy = () => {
	copy();
	toast.add({
		title: 'Copied to clipboard',
		description: 'Share this link with your friends',
	});
};
</script>

<template>
	<button @click="handleCopy">
		<slot>
			<Icon name="uil:copy" />
		</slot>
	</button>
</template>
