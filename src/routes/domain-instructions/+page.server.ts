import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
// import { auth } from '$lib/server/lucia';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth?.validate();
	if (!session) redirect(302, '/login');

	return {};
};
