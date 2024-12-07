<script setup lang="ts">
useHead({
	meta: [{ charset: 'utf-8' }, { name: 'viewport', content: 'width=device-width, initial-scale=1' }],
	link: [{ rel: 'icon', href: '/favicon.ico' }],
	htmlAttrs: {
		lang: 'en',
	},
});

useSeoMeta({
	titleTemplate: '%s / Open Source Santa',
	ogSiteName: 'Open Source Santa',
});

useSchemaOrg([
	defineOrganization({
		'@id': 'https://opensourcesanta.com/#organization',
		name: 'Open Source Santa',
		// @TODO: Swap for full logo
		logo: '/favicon.icon',
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
