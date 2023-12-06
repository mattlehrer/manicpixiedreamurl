import type { Config } from 'drizzle-kit';

export default {
	schema: './src/schema.ts',
	out: './drizzle/migrations',
	driver: 'better-sqlite',
	dbCredentials: {
		url: './sqlite.db',
	},
} satisfies Config;
