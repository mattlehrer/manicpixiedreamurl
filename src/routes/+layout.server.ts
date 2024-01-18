import { authSessionCookieName, dashboardSites } from '$lib/config';
import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getDomainByName, getIdeasWithVotesForDomainId, getRandomDomains } from '$lib/server/handlers';
import { sessionTokens } from '$lib/server/session_token';
import { dev } from '$app/environment';
import { lucia as auth } from '$lib/server/lucia';

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
		let isEmailVerified = false;
		if (!sessionCookie) {
			const token = url.searchParams.get('token');
			if (token) {
				const sessionId = sessionTokens.get(token);
				if (sessionId) {
					cookies.set(authSessionCookieName, sessionId, cookieOpts);
					cookies.delete('mpdu_session_checked', cookieOpts);
					sessionTokens.delete(token);
					const { session, user } = await auth.validateSession(sessionId);
					if (session) {
						loggedIn = true;
						userId = user.id;
						isEmailVerified = user.hasVerifiedEmail;
					}
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
			if (locals.session && locals.user) {
				loggedIn = true;
				userId = locals.user.id;
				isEmailVerified = locals.user.hasVerifiedEmail;
			}
		}

		const domainData = await getDomainByName(url.hostname);

		if (!domainData) {
			console.error(`Domain not found: ${url.hostname}`);
			error(404, 'Not found');
		}

		const ideaData = (await getIdeasWithVotesForDomainId(domainData.id)).map((idea) => ({
			...idea,
			isDomainOwners: idea.ownerId === domainData.ownerId,
			votes: idea.votes.map((vote) => ({
				...vote,
				userId: vote.userId === userId ? userId : undefined,
			})),
		}));

		const newIdea = url.searchParams.get('idea') ?? '';

		const discoveryDomains = await getRandomDomains(3, domainData.id);

		return {
			host: url.host.toLowerCase().replace(/^www\./, ''),
			pathname: url.pathname,
			origin: url.origin,
			domain: domainData,
			ideas: ideaData,
			newIdea,
			loggedIn,
			userId,
			isEmailVerified,
			discoveryDomains,
		};
	}

	const discoveryDomains = await getRandomDomains(3);

	return {
		origin: url.origin,
		host: url.host,
		pathname: url.pathname,
		username: locals.user?.username,
		loggedIn: !!locals.session,
		discoveryDomains,
	};
};
