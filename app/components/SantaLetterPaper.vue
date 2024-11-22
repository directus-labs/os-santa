<script setup lang="ts">
defineSlots<{
	default: () => any;
}>();
</script>

<template>
	<div class="relative flex flex-col overflow-hidden">
		<!-- Main paper with subtle texture and warm color -->
		<div class="absolute inset-0 bg-amber-50 shadow-xl rounded-xl overflow-hidden h-full">
			<!-- Subtle paper texture overlay -->
			<div
				class="absolute inset-0 opacity-5"
				style="
					background-image: url('data:image/svg+xml,%3Csvg width='100' height='100' viewBox='00100100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E');
				"
			></div>

			<!-- Decorative border -->
			<div class="absolute inset-4 border-4 border-red-900/10 rounded-lg"></div>

			<!-- Top decorative header -->
			<div class="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-red-900/5 to-transparent">
				<!-- North Pole Post seal -->
				<div class="absolute -top-6 -right-6 w-32 h-32">
					<div class="absolute inset-0 rounded-full bg-red-900/10 rotate-12"></div>
					<div class="absolute inset-2 rounded-full bg-red-900/10 -rotate-6"></div>
					<div
						class="absolute inset-4 rounded-full bg-red-900/10 rotate-3 flex items-center justify-center text-red-900/30 font-serif text-xs"
					>
						NORTH POLE POST
					</div>
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

		<!-- Content with padding -->
		<div class="relative p-8 pt-32 pb-24">
			<slot />
		</div>
	</div>
</template>
