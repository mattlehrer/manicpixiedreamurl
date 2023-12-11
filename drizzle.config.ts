import type { Config } from 'drizzle-kit';

export default {
	schema: './src/lib/schema.ts',
	out: './drizzle/migrations',
	driver: 'better-sqlite',
	breakpoints: true,
	dbCredentials: {
		url: './sqlite.db',
	},
} satisfies Config;
