import { lucia } from '$lib/server/lucia';
import isEmail from 'validator/lib/isEmail';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import Database from 'better-sqlite3';
import { sendVerificationEmail } from '$lib/server/email';
import { dashboardSites } from '$lib/config';
import {
	getDomainByName,
	insertDownVote,
	insertIdea,
	insertPassword,
	insertUpVote,
	insertUser,
} from '$lib/server/handlers';
import { dev } from '$app/environment';
import { Argon2id } from 'oslo/password';
import { generateId } from 'lucia';
import { analytics } from '$lib/server/analytics';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.user) {
		const domain = url.searchParams.get('redirect');
		if (!domain) redirect(307, '/');
		const redirectTo = new URL('/check-session', dashboardSites[0]);
		redirectTo.searchParams.append('redirect', domain);

		const idea = url.searchParams.get('idea');
		if (idea) {
			const domainId = (await getDomainByName(dev ? domain.replace(':5173', '') : domain))?.id;
			if (!domainId) return redirect(302, redirectTo.href);
			await insertIdea({ domainId, ownerId: locals.user.id, text: idea });
		}

		const downvote = url.searchParams.get('downvote');
		if (downvote) {
			await insertDownVote({ ideaId: downvote, userId: locals.user.id });
		}

		const upvote = url.searchParams.get('upvote');
		if (upvote) {
			await insertUpVote({ ideaId: upvote, userId: locals.user.id });
		}

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
	const e = url.searchParams.get('error');

	return {
		loginLink: loginLink.pathname + loginLink.search,
		error: e,
	};
};

export const actions: Actions = {
	default: async ({ request, url, cookies }) => {
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

			const userId = generateId(15);
			const hashedPassword = await new Argon2id().hash(password);

			await insertUser({ id: userId, username, email });

			await insertPassword({ userId, hashedPassword });

			const session = await lucia.createSession(userId, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '/',
				...sessionCookie.attributes,
			});

			analytics.identify({
				userId,
				traits: {
					username,
					email,
				},
			});

			await sendVerificationEmail({ email, id: userId });
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

		// Can't submit vote before email verification so not doing this
		// const upvote = url.searchParams.get('upvote');
		// if (upvote) redirectTo.searchParams.append('voted', '1');
		// const downvote = url.searchParams.get('downvote');
		// if (downvote) redirectTo.searchParams.append('voted', '1');

		redirect(302, redirectTo.href);
	},
};
