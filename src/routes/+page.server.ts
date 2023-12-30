import { getDomainByName, getIdeaForDomainByText, insertIdea } from '$lib/server/handlers';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { dashboardSites } from '$lib/config';

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

		if (!session.user.hasVerifiedEmail) {
			const redirectTo = new URL('/dashboard', dashboardSites[0]);
			return redirect(302, redirectTo);
		}

		const domain = url.hostname;
		const domainExists = await getDomainByName(domain);
		if (!domainExists) return fail(404, { message: 'Not found' });
		const domainId = domainExists.id;

		if (!domainId || typeof domainId !== 'string') error(404, { message: 'Not found' });
		if (!idea || typeof idea !== 'string' || !idea.trim() || idea.length <= 5)
			return fail(400, { idea, invalid: true });

		const newIdea = idea.trim();

		const ideaExists = await getIdeaForDomainByText(domainId, newIdea);
		if (ideaExists) return fail(400, { notUnique: 'Idea already exists' });

		const inserted = await insertIdea({
			ownerId: session.user.userId,
			domainId,
			text: newIdea,
		});

		return { inserted };
	},
};
