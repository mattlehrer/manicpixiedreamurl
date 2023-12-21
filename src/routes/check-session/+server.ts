import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { authSessionCookieName } from '$lib/config';
import { sessionTokens } from '$lib/server/session_token';
import { createId } from '@paralleldrive/cuid2';

export const GET: RequestHandler = async ({ url, locals, cookies }) => {
	const domain = url.searchParams.get('domain');
	if (!domain) {
		redirect(307, '/');
	}
	const session = await locals.auth.validate();
	const location = `${url.protocol}//${domain}:${url.port}`;
	// const response = new Response(null, {
	// 	status: 307,
	// 	headers: {
	// 		Location: location,
	// 	},
	// });
	if (!session) {
		return redirect(307, location + `?token=${createId()}`);
	} else {
		// response.headers.append('Set-Cookie', `${authSessionCookieName}=${cookies.get(authSessionCookieName)}`);
		// add short-lived token to db for session
		const token = createId();
		const session = cookies.get(authSessionCookieName);
		if (!session) error(500, 'Something went wrong.');
		sessionTokens.set(token, session);
		return redirect(307, location + '?token=' + token);
	}
};
