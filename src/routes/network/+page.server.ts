import { getDomainByName, insertIdea } from '$lib/server/handlers';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { dashboardSites } from '$lib/config';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
	addSuggestion: async ({ url, locals, request }) => {
		const session = await locals.auth.validate();
		const data = await request.formData();
		const idea = data && data.get('idea');

		if (!session) {
			const redirectTo = new URL('/signup', dashboardSites[0]);
			redirectTo.searchParams.append('redirect', url.host);
			if (idea && typeof idea === 'string') redirectTo.searchParams.append('idea', idea);
			redirect(302, redirectTo);
		}

		// TODO: add better messaging that the user needs to verify their email
		if (!session.user.hasVerifiedEmail) {
			const redirectTo = new URL('/dashboard', dashboardSites[0]);
			return redirect(302, redirectTo);
		}

		const domain = url.hostname;
		const exists = await getDomainByName(domain);
		if (!exists) return fail(404, { message: 'Not found' });
		const domainId = exists.id;

		if (!domainId || typeof domainId !== 'string') error(404, { message: 'Not found' });
		if (!idea || typeof idea !== 'string') return fail(400, { idea, invalid: true });

		const inserted = await insertIdea({
			ownerId: session.user.userId,
			domainId,
			text: idea,
		});

		return { inserted };
	},
};
