<script setup lang="ts">
const showHelpModal = useState('showHelpModal', () => false);
const copy = {
	help: `
		<p class="font-bold text-red-600">Salty Open Source Santa is a fun way to see if you've been a good open source contributor this year.</p>
		<ol>
			<li>Login to your GitHub account and write your letter to Santa.</li>
			<li>Santa will:
			<ul>
				<li>read your letter</li>
			<li>analyze your public GitHub activity</li>
				<li>decide if you've been naughty or nice</li>
				<li>and send you a letter back.</li>
			</ul>
			<li>Prepare yourself for a snarkyletter back.</li>
		</ol>
		<p><em>If you'd like to roast a friend or organization, toggle Friend Mode and enter their GitHub username instead.</em></p>
		<p class="font-bold">Concerned about privacy?</p>
		<ul>
			<li>Letters are publicly visible on your profile page by default, but you can opt out after generating your letter.</li>
			<li>Santa doesn't look up or store any private Github data, only publicly available information.</li>
		</ul>
	`,
};
</script>
<template>
	<div
		class="relative antialiased transition duration-150 text-gray-900 min-h-screen bg-gradient-to-b from-red-500 to-red-950"
	>
		<Navigation />
		<div class="relative">
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
		<PoweredBy class="mt-8 pb-8" />
		<ClientOnly>
			<Snow />
		</ClientOnly>
	</div>
</template>
