<script setup lang="ts">
function goHome() {
	clearError({ redirect: '/' });
}
</script>

<template>
	<UApp>
		<NuxtLayout name="default">
			<div class="flex flex-col items-center justify-center min-h-[60vh] text-white">
				<FeltPaper class="relative text-center space-y-6 py-12 px-8">
					<div class="text-6xl">🎵</div>
					<BaseHeadline content="Ho Ho... Oh No!" size="xl" />
					<BaseText as="p" size="lg" class="mx-auto max-w-md mt-4 text-gray-700">
						Oops! The page you are looking for does not exist.
					</BaseText>
					<div class="flex flex-wrap gap-4 justify-center items-center pt-4">
						<UButton size="lg" @click="goHome">Create a Carol</UButton>
					</div>
				</FeltPaper>
			</div>
		</NuxtLayout>
	</UApp>
</template>
