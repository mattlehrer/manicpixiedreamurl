import { authSessionCookieName, dashboardSites } from '$lib/config';
import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getDomainByName, getIdeasWithVotesForDomainId } from '$lib/server/handlers';
import { sessionTokens } from '$lib/server/session_token';
import { dev } from '$app/environment';

export const load: LayoutServerLoad = async ({ locals, url, cookies }) => {
	if (!dashboardSites.includes(url.origin)) {
		const sessionCookie = cookies.get(authSessionCookieName);
		if (!sessionCookie) {
			const token = url.searchParams.get('token');
			if (token) {
				const session = sessionTokens.get(token);
				if (session) {
					cookies.set(authSessionCookieName, session, {
						path: '/',
						secure: !dev,
					});
					sessionTokens.delete(token);
				} else {
					cookies.set('mpdu_session_checked', 'true', {
						path: '/',
						secure: !dev,
					});
				}
			} else {
				const redirectCookie = cookies.get('mpdu_session_checked');
				if (!redirectCookie) {
					redirect(302, `${dashboardSites[0]}/check-session?domain=${url.hostname}`);
				}
			}
		}

		const domainData = await getDomainByName(url.hostname);

		if (!domainData) {
			console.error(`Domain not found: ${url.hostname}`);
			error(404, 'Not found');
		}

		const ideaData = await getIdeasWithVotesForDomainId(domainData.id);

		return {
			host: url.host,
			pathname: url.pathname,
			domain: domainData,
			ideas: ideaData,
		};
	}

	const session = await locals.auth?.validate();

	return {
		origin: url.origin,
		host: url.host,
		pathname: url.pathname,
		username: session?.user.username,
	};
};
