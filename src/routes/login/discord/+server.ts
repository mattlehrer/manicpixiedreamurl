import { discord } from '$lib/server/auth';
import { generateState } from 'arctic';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { dev } from '$app/environment';

export const GET: RequestHandler = async ({ cookies }) => {
	const state = generateState();
	const url = await discord.createAuthorizationURL(state, { scopes: ['identify', 'email'] });
	url.searchParams.append('prompt', 'none');

	cookies.set('oauth_state', state, {
		path: '/',
		secure: !dev,
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: 'lax',
	});

	return redirect(302, url.toString());
};
