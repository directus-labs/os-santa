<script setup lang="ts">
useSeoMeta({
	title: 'Carol Submitted! - LinkedIn Carolling',
	description: 'Your Christmas carol request has been submitted. Check your email soon!',
});
</script>

<template>
	<div class="">
		<UContainer class="py-8 md:py-16">
			<div class="text-center mb-8">
				<BaseHeadline content="Carol Submitted!" size="xl" shadow class="mt-8" />
			</div>

			<div class="relative max-w-2xl mx-auto">
				<NotebookPaper>
					<div class="flex flex-col items-center gap-6 px-8 py-12 text-center">
						<div class="text-6xl">🎄</div>
						<h2 class="text-2xl md:text-3xl font-bold text-gray-900 font-cursive">Your carol is being created!</h2>
						<p class="text-gray-700 text-lg font-cursive max-w-md">
							Our elves are hard at work crafting a personalized Christmas carol. You'll receive an email when it's
							ready to share!
						</p>
						<div class="flex flex-col sm:flex-row gap-4 mt-4">
							<UButton to="/" variant="solid" size="xl" class="bg-green-600 hover:bg-green-700">
								Create Another Carol
							</UButton>
						</div>
						<p class="text-gray-600 text-sm font-mono mt-4">
							This usually takes just a few minutes. Check your spam folder if you don't see it!
						</p>
					</div>
				</NotebookPaper>
			</div>
		</UContainer>
	</div>
</template>
