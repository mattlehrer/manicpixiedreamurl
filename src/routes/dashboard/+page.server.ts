import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/lucia';
import { getDomainsForUser, insertDomain } from '$lib/server/handlers';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth?.validate();
	if (!session) throw redirect(302, '/login');

	const domains = getDomainsForUser(session.user.userId);

	return {
		userId: session.user.userId,
		username: session.user.username,
		domains,
	};
};

export const actions: Actions = {
	addDomain: async ({ locals, request }) => {
		const session = await locals.auth.validate();
		if (!session) return fail(401);
		const data = await request.formData();
		const domain = data.get('domain');
		if (!domain || typeof domain !== 'string') return fail(400);

		const inserted = await insertDomain({
			ownerId: session.user.userId,
			name: domain,
			isActive: true,
			createdAt: new Date().toUTCString(),
			updatedAt: new Date().toUTCString(),
		});
		console.log({ inserted });

		return { inserted };
	},
	logout: async ({ locals }) => {
		const session = await locals.auth.validate();
		if (!session) return fail(401);
		await auth.invalidateSession(session.sessionId); // invalidate session
		locals.auth.setSession(null); // remove cookie
		throw redirect(302, '/login'); // redirect to login page
	},
};
