<script setup lang="ts">
const props = withDefaults(
	defineProps<{
		profileName?: string;
		title?: string;
	}>(),
	{
		profileName: 'Someone Special',
		title: 'A Christmas Carol',
	},
);
</script>

<template>
	<div class="w-full h-full flex flex-col bg-red-900 p-12">
		<div
			class="relative pt-[60px] pb-[70px] px-[6.75rem] h-full flex flex-col justify-between bg-[#f7e9d3] rounded-lg p-8"
			:style="{ transform: 'rotate(6deg)' }"
		>
			<!-- BORDER -->
			<div
				class="absolute w-full h-full border-4 border-red-900 rounded-lg flex items-center justify-center m-8 inset-0"
			/>
			<div class="flex flex-col mt-12 gap-8 px-12 text-center">
				<div>
					<p class="text-red-900 text-[30px] mb-[10px]">A Christmas Carol for</p>
					<h1 class="mb-[20px] text-[70px] font-normal text-gray-900">{{ profileName }}</h1>
					<p class="text-red-900 text-[40px] font-cursive italic">"{{ title }}"</p>
				</div>
				<div class="text-6xl mt-4">🎄🎵🎄</div>
			</div>
			<!-- Postage Stamp -->
			<div class="absolute top-12 right-12 flex items-start">
				<img src="/images/stamp.png" class="object-contain w-[150px] h-[150px]" width="200" height="200" />
			</div>
		</div>
	</div>
</template>
