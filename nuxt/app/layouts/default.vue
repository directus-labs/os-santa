<script setup lang="ts"></script>
<template>
	<div class="relative antialiased transition duration-150 text-gray-900 min-h-screen bg-gradient-to-b from-red-500 to-red-950">
		<Navigation />
		<div class="relative">
			<slot />
		</div>
		<PoweredBy class="mt-8 pb-8" />
		<ClientOnly>
			<Snow />
		</ClientOnly>
	</div>
</template>
