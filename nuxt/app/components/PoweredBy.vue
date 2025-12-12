<template>
	<div class="relative p-4 pb-24 lg:pb-12">
		<img
			src="/images/snow-scene.png"
			alt="Snow Scene"
			class="absolute bottom-0 right-0 w-screen left-1/2 -translate-x-1/2"
		/>

		<p class="relative text-center text-white text-2xl flex justify-center items-center gap-2 font-bold">
			Powered by
			<NuxtLink to="https://directus.io?ref=os_santa_footer">
				<Logo class="h-8 text-white hover:text-green-500 transition-colors duration-300" />
			</NuxtLink>
		</p>
		<p class="relative text-center font-cursive text-white text-3xl mt-4">The CMS + backend that sleighs</p>
	</div>
</template>
