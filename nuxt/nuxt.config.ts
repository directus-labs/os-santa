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
		'@nuxt/scripts',
		'@vueuse/nuxt',
		'@formkit/auto-animate/nuxt',
		'nuxt-auth-utils',
		'nuxt-security',
		'nuxt-posthog',
	],

	$production: {
		scripts: {
			registry: {
				googleTagManager: true,
			},
		},
	},

	runtimeConfig: {
		public: {
			siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
			scripts: {
				googleTagManagerId: process.env.GOOGLE_TAG_MANAGER_ID!,
			},
		},
		directusUrl: process.env.DIRECTUS_URL,
		directusServerToken: process.env.DIRECTUS_SERVER_TOKEN,
		anthropicApiKey: process.env.ANTHROPIC_API_KEY,
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
				'script-src': [
					"'self'",
					"'unsafe-inline'",
					'https://www.googletagmanager.com',
					'https://us.i.posthog.com',
					'https://us-assets.i.posthog.com',
				],
				'connect-src': [
					"'self'",
					'https://www.google-analytics.com',
					'https://us.i.posthog.com',
					'https://us-assets.i.posthog.com',
				],
			},
		},
	},

	devtools: { enabled: true },

	// Image Configuration - https://image.nuxt.com/providers/directus
	image: {
		providers: {
			directus: {
				provider: 'directus',
				options: {
					baseURL: `${process.env.DIRECTUS_URL}/assets/`,
				},
			},
			local: {
				provider: 'ipx',
			},
		},
	},

	// Posthog Configuration - https://nuxt-posthog.cmitjans.dev/configuration
	// @ts-ignore
	posthog: {
		disabled: process.env.VERCEL_ENV === 'development' || process.env.NODE_ENV === 'development',
	},

	colorMode: {
		// Force light mode
		preference: 'light',
	},

	ogImage: {
		fonts: ['Caveat:400', 'DM Sans:400'],
		defaults: {
			cacheMaxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
		},
	},

	vite: {
		optimizeDeps: {
			// Needed for vueuse/sound
			include: ['howler'],
		},
	},

	site: {
		url: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
		name: 'Open Source Santa Claus',
	},

	compatibilityDate: '2024-11-14',
});
