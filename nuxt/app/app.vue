<script setup lang="ts">
useHead({
	meta: [{ charset: 'utf-8' }, { name: 'viewport', content: 'width=device-width, initial-scale=1' }],
	link: [{ rel: 'icon', href: '/favicon.ico' }],
	htmlAttrs: {
		lang: 'en',
	},
});

useSeoMeta({
	titleTemplate: '%s / Salty Open Source Santa',
	description:
		"Santa knows who's been naughty and who's been nice in the open source community. Write your letter to Santa to find out if you're on his good side.",
	ogSiteName: 'Salty Open Source Santa',
});

useSchemaOrg([
	defineOrganization({
		'@id': 'https://opensourcesanta.com/#organization',
		name: 'Salty Open Source Santa',
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
