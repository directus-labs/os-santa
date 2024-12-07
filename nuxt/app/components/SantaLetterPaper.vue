<script setup lang="ts">
defineSlots<{
	default: () => any;
}>();
</script>

<template>
	<div class="relative flex flex-col overflow-hidden">
		<div class="absolute inset-0 bg-amber-50 shadow-xl rounded-xl overflow-hidden h-full">
			<!-- Decorative border -->
			<div class="absolute inset-4 border-4 border-red-900/10 rounded-lg"></div>
			<!-- Top decorative header -->
			<div class="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-red-900/5 to-transparent">
				<!-- North Pole Post seal -->
				<div class="absolute top-4 right-4 w-16 sm:w-32">
					<img src="/images/stamp.png" alt="North Pole Post" class="object-contain" width="128" />
				</div>
				<!-- Santa's Workshop letterhead -->
				<div class="absolute top-6 left-1/2 -translate-x-1/2 text-center">
					<h1 class="font-serif text-red-900 text-xl font-bold">From the Desk of</h1>
					<h2 class="font-serif text-red-900/90 text-2xl font-bold mt-1">Open Source Santa Claus</h2>
				</div>
			</div>
			<!-- Bottom decorative footer -->
			<div class="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-red-900/5 to-transparent">
				<!-- Decorative snowflake pattern -->
				<div class="absolute bottom-4 left-1/2 -translate-x-1/2 text-red-900/20 flex gap-4">❄ ❆ ❅ ❄ ❆ ❅ ❄</div>
			</div>
		</div>
		<!-- Content -->
		<div class="relative p-8 pt-32 pb-24">
			<slot />
		</div>
	</div>
</template>
