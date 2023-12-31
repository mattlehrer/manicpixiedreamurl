import { authSessionCookieName, dashboardSites } from '$lib/config';
import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getDomainByName, getIdeasWithVotesForDomainId } from '$lib/server/handlers';
import { sessionTokens } from '$lib/server/session_token';
import { dev } from '$app/environment';
import { auth } from '$lib/server/lucia';

const cookieOpts = {
	path: '/',
	secure: !dev,
	sameSite: 'lax',
	httpOnly: true,
} as const;

export const load: LayoutServerLoad = async ({ locals, url, cookies }) => {
	if (!dashboardSites.includes(url.origin)) {
		const sessionCookie = cookies.get(authSessionCookieName);
		let loggedIn = false;
		let userId: string | undefined = undefined;
		if (!sessionCookie) {
			const token = url.searchParams.get('token');
			if (token) {
				const sessionId = sessionTokens.get(token);
				if (sessionId) {
					cookies.set(authSessionCookieName, sessionId, cookieOpts);
					cookies.delete('mpdu_session_checked', cookieOpts);
					sessionTokens.delete(token);
					loggedIn = true;
					const session = await auth.getSession(sessionId);
					userId = session?.user.userId;
				} else {
					cookies.set('mpdu_session_checked', 'true', cookieOpts);
				}
			} else {
				const redirectCookie = cookies.get('mpdu_session_checked');
				if (!redirectCookie) {
					const redirectTo = new URL('/check-session', dashboardSites[0]);
					redirectTo.searchParams.append('redirect', url.host);
					redirect(302, redirectTo.href);
				}
			}
		} else {
			loggedIn = true;
			const session = await locals.auth.validate();
			userId = session?.user.userId;
		}

		const domainData = await getDomainByName(url.hostname);

		if (!domainData) {
			console.error(`Domain not found: ${url.hostname}`);
			error(404, 'Not found');
		}

		const ideaData = (await getIdeasWithVotesForDomainId(domainData.id)).map((idea) => ({
			...idea,
			votes: idea.votes.map((vote) => ({
				...vote,
				userId: vote.userId === userId ? userId : undefined,
			})),
		}));

		const newIdea = url.searchParams.get('idea') ?? '';

		return {
			host: url.host,
			pathname: url.pathname,
			domain: domainData,
			ideas: ideaData,
			newIdea,
			loggedIn,
			userId,
		};
	}

	const session = await locals.auth?.validate();

	return {
		origin: url.origin,
		host: url.host,
		pathname: url.pathname,
		username: session?.user.username,
		loggedIn: !!session,
	};
};
