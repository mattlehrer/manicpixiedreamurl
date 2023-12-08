import { dashboardSite } from '$lib/config';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const host = url.host;
	if (host !== dashboardSite && !['/'].includes(url.pathname)) {
		throw redirect(303, '/');
	}

	const session = await locals.auth?.validate();

	return {
		host,
		username: session?.user.username,
	};
};
