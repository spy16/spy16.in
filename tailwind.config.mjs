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
			},
			typography(theme) {
				return {
					DEFAULT: {
						css: {
							'code::before': {
								content: 'none',
							},
							'code::after': {
								content: 'none'
							},
							code: {
								fontWeight: '400',
								padding: '1px 4px',
								backgroundColor: theme('colors.gray.200'),
							},
						}
					}
				}
			},
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
