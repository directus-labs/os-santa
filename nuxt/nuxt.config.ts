export default defineNuxtConfig({
	// https://nuxt.com/docs/api/configuration/nuxt-config

	future: {
		compatibilityVersion: 4,
	},

	css: ['~/assets/css/main.css'],

	modules: [
		'@nuxt/ui',
		'@nuxt/image',
		'@nuxtjs/seo',
		'@vueuse/motion/nuxt',
		'@vueuse/nuxt',
		'@formkit/auto-animate/nuxt',
		'nuxt-auth-utils',
		// 'nuxt-security',
	],

	runtimeConfig: {
		public: {
			siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
		},
		directusUrl: process.env.DIRECTUS_URL,
		directusServerToken: process.env.DIRECTUS_SERVER_TOKEN,
		oauth: {
			github: {
				clientId: process.env.GITHUB_CLIENT_ID,
				clientSecret: process.env.GITHUB_CLIENT_SECRET,
			},
		},
	},

	security: {
		headers: {
			contentSecurityPolicy: {
				'img-src': ["'self'", 'data:', 'https://github.com', 'https://*.githubusercontent.com'],
			},
		},
	},

	devtools: { enabled: true },

	// Image Configuration - https://image.nuxt.com/providers/directus
	image: {
		// provider: 'directus',
		// directus: {
		// 	baseURL: `${process.env.DIRECTUS_URL}/assets/`,
		// },
	},

	ogImage: {
		fonts: ['Caveat:400', 'DM+Sans:400', 'Playfair+Display:400'],
	},

	vite: {
		optimizeDeps: {
			include: ['howler'],
		},
	},

	site: {
		url: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
		name: 'Open Source Santa Claus',
	},

	compatibilityDate: '2024-11-14',
});
