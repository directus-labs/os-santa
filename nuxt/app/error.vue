<script setup lang="ts">
function goHome() {
	clearError({ redirect: '/' });
}
function goToList() {
	clearError({ redirect: '/list' });
}
</script>

<template>
	<UApp>
		<NuxtLayout name="default">
			<div
				class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-red-500 to-red-950 text-white"
			>
				<NotebookPaper class="relative text-center space-y-6 bg-red-900/80 py-24 px-8 rounded-lg">
					<BaseHeadline content="Ho oh no!" size="xl" color="secondary" />
					<BaseText as="p" size="lg" class="mx-auto max-w-md mt-4 text-red-900">
						Oops! The page you are looking for does not exist.
					</BaseText>
					<div class="flex flex-wrap gap-4 justify-center items-center">
						<UButton class="mt-4" @click="goHome">Write a letter to Santa</UButton>
						<UButton class="mt-4" variant="outline" @click="goToList">View Santa's List</UButton>
					</div>
				</NotebookPaper>
			</div>
		</NuxtLayout>
	</UApp>
</template>

<style scoped>
.text-shadow {
	text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}
</style>
