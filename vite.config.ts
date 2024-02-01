import { sentrySvelteKit } from '@sentry/sveltekit';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import postcssCustomMedia from 'postcss-custom-media';
import version from 'vite-plugin-package-version';
// import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
	// server: {
	// 	https: true,
	// },
	plugins: [
		version(),
		sentrySvelteKit({
			sourceMapsUploadOptions: {
				org: 'manic-pixie-dream-url',
				project: 'javascript-sveltekit',
			},
		}),
		// mkcert({
		// 	hosts: ['localhost', 'a.test', 'b.test'],
		// }),
		sveltekit(),
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
	},
	css: {
		postcss: {
			plugins: [postcssCustomMedia],
		},
	},
});
