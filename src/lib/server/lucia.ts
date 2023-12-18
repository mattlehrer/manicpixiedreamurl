import { lucia } from 'lucia';
import { sveltekit } from 'lucia/middleware';
import { betterSqlite3 } from '@lucia-auth/adapter-sqlite';
import { dev } from '$app/environment';
import { sqliteDatabase } from './db';

export const auth = lucia({
	env: dev ? 'DEV' : 'PROD',
	middleware: sveltekit(),
	adapter: betterSqlite3(sqliteDatabase, {
		user: 'user',
		key: 'user_key',
		session: 'user_session',
	}),

	getUserAttributes: (data) => {
		return {
			username: data.username,
			email: data.email,
			hasVerifiedEmail: !!data.has_verified_email,
		};
	},
});

export type Auth = typeof auth;
