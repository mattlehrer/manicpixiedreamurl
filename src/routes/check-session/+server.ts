import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sessionTokens } from '$lib/server/session_token';
import { createId } from '@paralleldrive/cuid2';

export const GET: RequestHandler = async ({ url, locals }) => {
	const domain = url.searchParams.get('redirect');
	if (!domain) {
		redirect(307, '/');
	}
	const session = await locals.auth.validate();
	const redirectTo = new URL('/', `${url.protocol}//${domain}`);
	if (!session) {
		redirectTo.searchParams.append('token', createId());
		return redirect(307, redirectTo.href);
	} else {
		// add short-lived token to db for session
		const token = createId();
		sessionTokens.set(token, session.sessionId);
		const idea = url.searchParams.get('idea');
		redirectTo.searchParams.append('token', token);
		if (idea) redirectTo.searchParams.append('idea', idea);
		return redirect(307, redirectTo.href);
	}
};
