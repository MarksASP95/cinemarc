import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { SvelteKitPWA } from '@vite-pwa/sveltekit'

export default defineConfig({
	plugins: [
		sveltekit(),
		SvelteKitPWA({
      strategies: 'injectManifest',
      srcDir: '.src',
      filename: 'prompt-sw.ts',
			scope: '/',
			base: '/',
			injectManifest: {
				globPatterns: ['client/**/*.{js,css,ico,png,svg,webp,woff,woff2}']
			},
			workbox: {
				globPatterns: ['client/**/*.{js,css,ico,png,svg,webp,woff,woff2}']
			},
			manifest: {
				short_name: "Cinemarc",
				name: "Cinemarc",
				start_url: "/",
				icons: [
					{
						src: "brad.png",
						type: "image/png",
						sizes: "512x512"
					}
				],
				background_color: "#3F2958",
				display: "standalone",
				scope: "/",
				theme_color: "#3F2958",
				description: "Cinemarc"
			}
      /* other pwa options */  
    })
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
