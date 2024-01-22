import { lucia } from '$lib/server/lucia';
import { Argon2id } from 'oslo/password';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { dashboardSites } from '$lib/config';
import {
	getDomainByName,
	getUserByUsernameWithPassword,
	insertDownVote,
	insertIdea,
	insertUpVote,
} from '$lib/server/handlers';
import { dev } from '$app/environment';
import { analytics } from '$lib/server/analytics';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.user) {
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
	const e = url.searchParams.get('error');
	return {
		error: e,
	};
};

export const actions: Actions = {
	default: async ({ request, url, cookies, locals }) => {
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

		const existingUser = await getUserByUsernameWithPassword(username);
		if (!existingUser) {
			return fail(400, {
				message: 'Incorrect username or password',
			});
		}

		if (!existingUser.password) {
			return fail(500, {
				message: `You don't have a password and probably signed up using a social login. You can request a password reset email if you want to set a password.`,
			});
		}

		const validPassword = await new Argon2id().verify(existingUser.password.hashedPassword, password);
		if (!validPassword) {
			return fail(400, {
				message: 'Incorrect username or password',
			});
		}

		const session = await lucia.createSession(existingUser.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '/',
			...sessionCookie.attributes,
		});

		analytics.identify({
			userId: existingUser.id,
		});

		analytics.track({
			userId: existingUser.id,
			event: 'Logged In',
			properties: {
				method: 'password',
			},
		});

		const redirectTo = new URL('/check-session', dashboardSites[0]);
		const domain = url.searchParams.get('redirect');
		if (!domain) {
			redirect(307, '/dashboard');
		}

		const upvote = url.searchParams.get('upvote');
		if (upvote) {
			await insertUpVote({ ideaId: upvote, userId: existingUser.id }).catch((e: unknown) => {
				if (e instanceof Error) {
					locals.error = e.message;
					locals.errorStackTrace = e.stack;
				} else {
					locals.error = JSON.stringify(e);
				}
			});
		}
		const downvote = url.searchParams.get('downvote');
		if (downvote) {
			await insertDownVote({ ideaId: downvote, userId: existingUser.id }).catch((e: unknown) => {
				if (e instanceof Error) {
					locals.error = e.message;
					locals.errorStackTrace = e.stack;
				} else {
					locals.error = JSON.stringify(e);
				}
			});
		}

		redirectTo.searchParams.append('redirect', domain);
		const idea = url.searchParams.get('idea');
		if (idea) {
			const domainId = (await getDomainByName(dev ? domain.replace(':5173', '') : domain))?.id;
			if (!domainId) return redirect(302, redirectTo.href);
			await insertIdea({ domainId, ownerId: existingUser.id, text: idea });
		}

		redirect(302, redirectTo.href);
	},
};
