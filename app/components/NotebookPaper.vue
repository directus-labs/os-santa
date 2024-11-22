<script setup lang="ts">
defineSlots<{
	default: () => any;
}>();

// Use a fixed number of holes based on viewport height
const numberOfHoles = computed(() => {
	// Assuming minimum viewport height of 800px and 25px spacing
	return Math.ceil(800 / 20);
});
</script>

<template>
	<div class="relative flex flex-col min-h-[800px] overflow-hidden">
		<!-- Notebook paper styling -->
		<div class="absolute inset-0 bg-white shadow-lg rounded-r-xl">
			<!-- Blue horizontal lines - using fixed height container -->
			<div
				class="absolute inset-0 min-h-[800px]"
				style="
					background-image: repeating-linear-gradient(0deg, transparent, transparent 23px, #e6e9f0 23px, #e6e9f0 24px);
				"
			></div>
			<!-- Pink vertical margin line -->
			<div class="absolute left-[50px] top-0 bottom-0 w-[1px] bg-pink-200"></div>

			<!-- Spiral binding holes with fixed spacing -->
			<div class="absolute -left-[1px] top-0 h-full w-[15px] flex flex-col gap-[25px] pt-4">
				<div
					v-for="n in numberOfHoles"
					:key="n"
					class="h-[15px] flex-none w-[15px] rounded-full bg-red-800 shadow-inner"
				></div>
			</div>
		</div>

		<!-- Decorative candy cane -->
		<img src="/images/candy-cane.png" class="w-24 absolute bottom-4 left-8 rotate-12 opacity-50" />

		<!-- Content with adjusted padding for margin line -->
		<div class="relative p-4 md:p-8">
			<slot />
		</div>
	</div>
</template>
