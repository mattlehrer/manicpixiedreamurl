import { dashboardSites } from '$lib/config';
import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getDomainByName } from '$lib/server/handlers';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	if (!dashboardSites.includes(url.origin)) {
		if (!['/'].includes(url.pathname)) {
			throw redirect(303, '/');
		}

		const domainData = await getDomainByName(url.hostname);

		if (!domainData) {
			console.error(`Domain not found: ${url.hostname}`);
			throw error(404, 'Domain not found');
		}

		return {
			host: url.host,
			pathname: url.pathname,
			domain: domainData,
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
