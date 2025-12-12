<script setup lang="ts">
const showHelpModal = useState('showHelpModal', () => false);
const copy = {
	help: `
		<p class="font-bold text-sky-600">The Merry Carol Machine creates personalized Christmas carols for anyone on LinkedIn!</p>
		<ol>
			<li>Enter a LinkedIn profile URL</li>
			<li>Add your name and email</li>
			<li>Our AI elves will compose a unique Christmas carol</li>
			<li>You'll receive an email when your carol is ready to share!</li>
		</ol>
		<p class="font-bold">How does it work?</p>
		<ul>
			<li>We use publicly available LinkedIn profile information to create personalized lyrics</li>
			<li>AI generates a unique Christmas carol based on the profile</li>
			<li>The carol is ready to share within a few minutes</li>
		</ul>
		<p class="font-bold">Privacy</p>
		<ul>
			<li>We only use publicly available LinkedIn information</li>
			<li>Your email is only used to notify you when your carol is ready</li>
		</ul>
	`,
};
</script>
<template>
	<div
		class="relative antialiased transition duration-150 text-gray-900 min-h-screen bg-linear-to-b from-sky-400 to-sky-800 flex flex-col"
	>
		<Navigation />
		<div class="relative z-10 grow">
			<slot />
			<!-- Help Modal -->
			<UDrawer :overlay="false" v-model:open="showHelpModal">
				<template #content>
					<UContainer>
						<div v-html="copy.help" class="prose py-8 max-h-[400px] md:max-h-[80vh] overflow-y-auto"></div>
					</UContainer>
				</template>
			</UDrawer>
		</div>
		<PoweredBy class="mt-auto pb-8" />
		<ClientOnly>
			<Snow />
		</ClientOnly>
	</div>
</template>
