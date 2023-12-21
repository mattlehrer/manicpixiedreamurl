import { getDomainByName, insertIdea } from '$lib/server/handlers';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
	addSuggestion: async ({ url, locals, request }) => {
		const session = await locals.auth.validate();
		if (!session) return fail(401);

		const data = await request.formData();
		const idea = data.get('idea');

		const domain = url.hostname;
		const exists = await getDomainByName(domain);
		if (!exists) return fail(404, { message: 'Not found' });
		const domainId = exists.id;

		console.log({ domainId, idea });

		if (!domainId || typeof domainId !== 'string') error(404, { message: 'Not found' });
		if (!idea || typeof idea !== 'string') return fail(400, { idea, invalid: true });

		const inserted = await insertIdea({
			ownerId: session.user.userId,
			domainId,
			text: idea,
		});
		console.log({ inserted });

		return { inserted };
	},
};
