<script setup lang="ts">
useHead({
	meta: [{ charset: 'utf-8' }, { name: 'viewport', content: 'width=device-width, initial-scale=1' }],
	link: [{ rel: 'icon', href: '/favicon.ico' }],
	htmlAttrs: {
		lang: 'en',
	},
});

useSeoMeta({
	titleTemplate: '%s / LinkedIn Carolling',
	description:
		'Create personalized Christmas carols for any LinkedIn profile. Spread holiday cheer with AI-generated festive music!',
	ogSiteName: 'LinkedIn Carolling',
});

useSchemaOrg([
	defineOrganization({
		'@id': 'https://linkedincarolling.com/#organization',
		name: 'LinkedIn Carolling',
		logo: '/favicon.ico',
		sameAs: [
			'https://x.com/directus',
			'https://www.youtube.com/@DirectusVideos',
			'https://www.linkedin.com/company/directus-io',
		],
	}),
]);
</script>
<template>
	<UApp>
		<NuxtLayout>
			<NuxtPage />
		</NuxtLayout>
	</UApp>
</template>
