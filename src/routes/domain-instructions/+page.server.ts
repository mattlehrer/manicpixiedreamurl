import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
// import { auth } from '$lib/server/lucia';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.session) redirect(302, '/login');

	return {};
};
