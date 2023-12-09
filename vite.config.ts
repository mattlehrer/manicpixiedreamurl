import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
// import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
	// server: {
	// 	https: true,
	// },
	plugins: [
		// mkcert({
		// 	hosts: ['localhost', 'a.test', 'b.test'],
		// }),
		sveltekit(),
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
	},
});
