import { dashboardSite } from '$lib/config';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	if (url.origin !== dashboardSite && !['/'].includes(url.pathname)) {
		throw redirect(303, '/');
	}

	const session = await locals.auth?.validate();

	return {
		origin: url.origin,
		host: url.host,
		pathname: url.pathname,
		username: session?.user.username,
	};
};
