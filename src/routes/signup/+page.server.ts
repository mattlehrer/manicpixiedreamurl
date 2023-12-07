import { auth } from '$lib/server/lucia';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import Database from 'better-sqlite3';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth?.validate();
	if (session) throw redirect(302, '/');
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const username = formData.get('username');
		const email = formData.get('email');
		const password = formData.get('password');
		// basic check
		if (typeof username !== 'string' || username.length < 3 || username.length > 31) {
			return fail(400, {
				username,
				email,
				invalidUsername: true,
			});
		}
		if (typeof email !== 'string' || email.length < 3 || email.length > 255 || !email.includes('@')) {
			return fail(400, {
				username,
				email,
				invalidEmail: true,
			});
		}
		if (typeof password !== 'string' || password.length < 4 || password.length > 255) {
			return fail(400, {
				username,
				email,
				invalidPassword: true,
			});
		}
		try {
			console.log('creating user');
			const user = await auth.createUser({
				key: {
					providerId: 'username', // auth method
					providerUserId: username.toLowerCase(), // unique id when using "username" auth method
					password, // hashed by Lucia
				},
				attributes: {
					email,
					username,
				},
			});
			console.log({ user });
			const session = await auth.createSession({
				userId: user.userId,
				attributes: {},
			});
			locals.auth.setSession(session); // set session cookie
		} catch (e) {
			console.error(e);
			if (e instanceof Database.SqliteError && e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
				return fail(400, {
					username,
					email,
					duplicate: true,
				});
			}
			return fail(500, {
				serverError: true,
			});
		}
		throw redirect(302, '/dashboard');
	},
};
