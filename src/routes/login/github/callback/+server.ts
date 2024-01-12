import { github } from '$lib/server/auth';
import { lucia } from '$lib/server/lucia';
import { OAuth2RequestError } from 'arctic';
import { generateId } from 'lucia';
import type { RequestHandler } from './$types';
import { getOauthAccount, insertOauthAccount } from '$lib/server/handlers';
import { error, redirect } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const storedState = cookies.get('github_oauth_state') ?? null;
	if (!code || !state || !storedState || state !== storedState) {
		return error(400);
	}

	try {
		const tokens = await github.validateAuthorizationCode(code);
		const githubUserResponse = await fetch('https://api.github.com/user', {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`,
			},
		});
		const githubUser: GitHubUser = await githubUserResponse.json();
		const existingUser = await getOauthAccount('github', githubUser.id);

		if (existingUser) {
			const session = await lucia.createSession(existingUser.user.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes,
			});
		} else {
			const userId = generateId(15);
			await insertOauthAccount({
				providerId: 'github',
				providerUserId: String(githubUser.id),
				userId: userId,
				email: githubUser.email,
				username: githubUser.login,
			});
			const session = await lucia.createSession(userId, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes,
			});
		}
		return redirect(302, '/');
	} catch (e) {
		console.log({ e });
		// the specific error message depends on the provider
		if (e instanceof OAuth2RequestError) {
			// invalid code
			return error(400);
		} else if (e instanceof Error && e.message === 'Unverified email') {
			redirect(302, '/login/?error=unverified-email');
		}
		return error(500);
	}
};

interface GitHubUser {
	id: string;
	login: string;
	email: string;
}
