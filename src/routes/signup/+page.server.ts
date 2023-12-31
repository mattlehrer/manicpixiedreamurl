import { auth } from '$lib/server/lucia';
import isEmail from 'validator/lib/isEmail';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import Database from 'better-sqlite3';
import { sendVerificationEmail } from '$lib/server/email';
import { dashboardSites } from '$lib/config';

export const load: PageServerLoad = async ({ locals, url }) => {
	const session = await locals.auth?.validate();
	if (session) {
		const domain = url.searchParams.get('redirect');
		if (!domain) redirect(307, '/');
		const redirectTo = new URL('/check-session', dashboardSites[0]);
		redirectTo.searchParams.append('redirect', domain);
		const idea = url.searchParams.get('idea');
		if (idea) redirectTo.searchParams.append('idea', idea);

		redirect(302, redirectTo.href);
	}

	const loginLink = new URL('/login', dashboardSites[0]);
	const redirectLocation = url.searchParams.get('redirect');
	if (redirectLocation) loginLink.searchParams.append('redirect', redirectLocation);
	const idea = url.searchParams.get('idea');
	if (idea) loginLink.searchParams.append('idea', idea);
	const upvote = url.searchParams.get('upvote');
	if (upvote) loginLink.searchParams.append('upvote', upvote);
	const downvote = url.searchParams.get('downvote');
	if (downvote) loginLink.searchParams.append('downvote', downvote);

	return {
		loginLink: loginLink.pathname + loginLink.search,
	};
};

export const actions: Actions = {
	default: async ({ request, locals, url }) => {
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
		if (typeof email !== 'string' || email.length < 3 || email.length > 255 || !isEmail(email)) {
			return fail(400, {
				username,
				email,
				invalidEmail: true,
			});
		}
		if (typeof password !== 'string' || password.length < 5 || password.length > 255) {
			return fail(400, {
				username,
				email,
				invalidPassword: true,
			});
		}
		try {
			console.debug('creating user');
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
			console.debug({ user });
			const session = await auth.createSession({
				userId: user.userId,
				attributes: {},
			});
			locals.auth.setSession(session); // set session cookie

			// send verification email
			await sendVerificationEmail({ ...user, id: user.userId });
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
		const redirectTo = new URL('/check-session', dashboardSites[0]);
		const redirectLocation = url.searchParams.get('redirect');
		if (!redirectLocation) {
			redirect(307, '/dashboard');
		}
		redirectTo.searchParams.append('redirect', redirectLocation);
		const idea = url.searchParams.get('idea');
		if (idea) redirectTo.searchParams.append('idea', idea);
		// const upvote = url.searchParams.get('upvote');
		// if (upvote) redirectTo.searchParams.append('voted', '1');
		// const downvote = url.searchParams.get('downvote');
		// if (downvote) redirectTo.searchParams.append('voted', '1');

		redirect(302, redirectTo.href);
	},
};
