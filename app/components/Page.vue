<script setup lang="ts">
interface PageProps {
	as?: 'div' | 'section' | 'article' | 'main' | 'aside' | 'footer' | 'header';
}

interface PageSlots {
	left?(props: PageProps): any;
	default?(props: PageProps): any;
	right?(props: PageProps): any;
}

const props = withDefaults(defineProps<PageProps>(), {
	as: 'div',
});

const slots = defineSlots<PageSlots>();
</script>

<template>
	<component :is="props.as" class="wrapper">
		<div v-if="slots.left" class="left">
			<slot name="left" />
		</div>
		<div class="content">
			<slot name="default" />
		</div>
		<div v-if="slots.right" class="right">
			<slot name="right" />
		</div>
	</component>
</template>

<style>
.wrapper {
	display: flex;
	flex-direction: column;
	position: relative;
}

@media (min-width: 64rem) {
	.wrapper {
		display: grid;
		grid-template-columns: 1fr 4fr 1fr;
		grid-column-gap: 32px;
	}

	.left {
		grid-column: 1;
		position: relative;
	}

	.right {
		grid-column: 3;
		position: relative;
	}

	.content {
		grid-column: 2;
	}
}
</style>
