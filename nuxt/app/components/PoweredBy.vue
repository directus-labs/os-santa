<template>
	<div class="relative p-4 pb-24 lg:pb-12">
		<img src="/images/snows.png" alt="Snow Scene" class="absolute bottom-0 right-0 w-full object-cover z-0" />

		<!-- Santa Bunny on top of snow scene -->
		<img src="/images/santa-bunny.png" alt="Santa Bunny" class="absolute bottom-0 left-1/4 w-48 md:w-64 lg:w-72 z-10" />

		<p
			class="relative z-20 text-center text-white text-shadow text-2xl flex justify-center items-center gap-2 font-bold"
		>
			Powered by
			<NuxtLink to="https://directus.io?ref=os_santa_footer">
				<Logo class="h-8 text-white hover:text-green-500 transition-colors duration-300" />
			</NuxtLink>
		</p>
		<p class="relative z-20 text-center font-cursive text-white text-3xl mt-4 text-shadow">
			The CMS + backend that sleighs
		</p>
	</div>
</template>
