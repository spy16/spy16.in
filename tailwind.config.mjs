/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				instagram: '#E1306C',
				github: '#0D1117',
				linkedin: '#2867B2',
				twitter: '#1DA1F2',
			},
			fontFamily: {
				// sans: ["Chilanka"],
			}
		},
	},
	plugins: [
		require("daisyui"),
		require('@tailwindcss/typography'),
	],
	daisyui: {
		themes: true,
	}
}
