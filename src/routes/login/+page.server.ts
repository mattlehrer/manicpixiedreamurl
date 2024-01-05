import { auth } from '$lib/server/lucia';
import { LuciaError } from 'lucia';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { dashboardSites } from '$lib/config';
import { getDomainByName, insertDownVote, insertIdea, insertUpVote } from '$lib/server/handlers';
import { dev } from '$app/environment';

export const load: PageServerLoad = async ({ locals, url }) => {
	const session = await locals.auth?.validate();
	if (session) {
		const domain = url.searchParams.get('redirect');
		if (!domain) {
			redirect(307, '/dashboard');
		}
		const redirectTo = new URL('/check-session', dashboardSites[0]);
		redirectTo.searchParams.append('redirect', domain);
		const idea = url.searchParams.get('idea');
		if (idea) redirectTo.searchParams.append('idea', idea);

		redirect(302, redirectTo.href);
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals, url }) => {
		const formData = await request.formData();

		const username = formData.get('username');
		const password = formData.get('password');
		// basic check
		if (typeof username !== 'string' || username.length < 1 || username.length > 31) {
			return fail(400, { username, invalidUsername: true });
		}
		if (typeof password !== 'string' || password.length < 1 || password.length > 255) {
			return fail(400, {
				invalidPassword: true,
			});
		}
		let key;
		let session;
		try {
			// find user by key
			// and validate password
			key = await auth.useKey('username', username.toLowerCase(), password);
			session = await auth.createSession({
				userId: key.userId,
				attributes: {},
			});
			locals.auth.setSession(session); // set session cookie
			await auth.deleteDeadUserSessions(key.userId);
		} catch (e) {
			console.error(e);
			if (e instanceof LuciaError && (e.message === 'AUTH_INVALID_KEY_ID' || e.message === 'AUTH_INVALID_PASSWORD')) {
				// user does not exist
				// or invalid password
				return fail(400, {
					message: 'Incorrect username or password',
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

		const upvote = url.searchParams.get('upvote');
		if (upvote) {
			await insertUpVote({ ideaId: upvote, userId: key.userId }).catch((e) => console.error(e));
		}
		const downvote = url.searchParams.get('downvote');
		if (downvote) {
			await insertDownVote({ ideaId: downvote, userId: key.userId }).catch((e) => console.error(e));
		}

		redirectTo.searchParams.append('redirect', redirectLocation);
		const idea = url.searchParams.get('idea');
		if (idea) {
			const domainId = (await getDomainByName(dev ? redirectLocation.replace(':5173', '') : domain))?.id;
			if (!domainId) return redirect(302, redirectTo.href);
			await insertIdea({ domainId, ownerId: session.user.userId, text: idea });
		}

		redirect(302, redirectTo.href);
	},
};
