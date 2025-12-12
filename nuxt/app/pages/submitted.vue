<script setup lang="ts">
useSeoMeta({
	title: 'Carol Submitted! - Carolling Carrots',
	description: 'Your Christmas carol request has been submitted. Check your email soon!',
});
</script>

<template>
	<div>
		<UContainer class="py-8 md:py-16">
			<div class="text-center mb-8">
				<BaseHeadline content="Carol Submitted!" size="xl" shadow class="mt-8" />
			</div>

			<div class="relative max-w-2xl mx-auto">
				<FeltPaper color="cream">
					<img src="/images/elf.gif" alt="Carolling Carrots" class="w-full h-72 object-contain" />
					<div class="flex flex-col items-center gap-6 text-center">
						<h2 class="text-2xl md:text-3xl font-bold text-emerald-900 font-cursive">Your carol is being created!</h2>
						<p class="text-emerald-800 text-lg max-w-md">
							Please be patient while our elves write this song! We’ll email it to you when it’s done.
						</p>
						<div class="flex flex-col sm:flex-row gap-4 mt-4">
							<UButton to="/" variant="solid" size="xl" class="bg-green-700 hover:bg-green-800">
								Create Another Carol
							</UButton>
						</div>
						<p class="text-emerald-700 text-sm mt-4">
							This usually takes just a few minutes. Check your spam folder if you don't see it!
						</p>
					</div>
				</FeltPaper>
			</div>
		</UContainer>
	</div>
</template>
