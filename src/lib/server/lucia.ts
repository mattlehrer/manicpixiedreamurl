import { Lucia } from 'lucia';
import { dev } from '$app/environment';
import { sqliteDatabase } from './db';
import { authSessionCookieName } from '$lib/config';
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';

import { drizzle } from 'drizzle-orm/better-sqlite3';
import { session, user } from '$lib/schema';
import type { User } from './handlers';

const db = drizzle(sqliteDatabase);

const adapter = new DrizzleSQLiteAdapter(db, session, user);

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		name: authSessionCookieName,
		attributes: {
			secure: !dev,
			sameSite: 'lax',
			path: '/',
		},
	},

	getUserAttributes: (attributes) => {
		return {
			username: attributes.username,
			email: attributes.email,
			hasVerifiedEmail: !!attributes.hasVerifiedEmail,
		};
	},
});

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: Omit<User, 'id'>;
	}
}
