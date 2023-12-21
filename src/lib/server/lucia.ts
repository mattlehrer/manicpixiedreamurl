import { lucia } from 'lucia';
import { sveltekit } from 'lucia/middleware';
import { betterSqlite3 } from '@lucia-auth/adapter-sqlite';
import { dev } from '$app/environment';
import { sqliteDatabase } from './db';
import { authSessionCookieName } from '$lib/config';

export const auth = lucia({
	env: dev ? 'DEV' : 'PROD',
	middleware: sveltekit(),
	adapter: betterSqlite3(sqliteDatabase, {
		user: 'user',
		key: 'user_key',
		session: 'user_session',
	}),
	sessionCookie: {
		name: authSessionCookieName,
		attributes: {
			sameSite: 'lax',
			path: '/',
		},
	},

	getUserAttributes: (data) => {
		return {
			username: data.username,
			email: data.email,
			hasVerifiedEmail: !!data.has_verified_email,
		};
	},
});

export type Auth = typeof auth;
