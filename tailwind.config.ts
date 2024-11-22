import type { Config } from 'tailwindcss';
import tailwindcssForms from '@tailwindcss/forms';
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
	darkMode: 'class',
	content: [
		'./components/**/*.{vue,js,ts}',
		'./layouts/**/*.vue',
		'./pages/**/*.vue',
		'./app.vue',
		'./plugins/**/*.{js,ts}',
		`./App.{js,ts,vue}`,
		`./app.{js,ts,vue}`,
		`./nuxt.config.{js,ts}`,
		`./form.theme.js`,
		`./formkit.config.{js,ts}`,
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Inter', ...defaultTheme.fontFamily.sans],
				display: ['Poppins', ...defaultTheme.fontFamily.serif],
				mono: ['Fira Code', ...defaultTheme.fontFamily.mono],
			},
			animation: {
				'fade-in': 'fade-in 0.5s linear forwards',
			},
			keyframes: {
				'fade-in': {
					from: {
						opacity: '0',
					},
					to: {
						opacity: '1',
					},
				},
			},
		},
	},

	variants: {
		extend: {},
	},

	plugins: [tailwindcssForms],
} satisfies Config;
