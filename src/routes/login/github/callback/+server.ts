import { github } from '$lib/server/auth';
import { lucia } from '$lib/server/lucia';
import { OAuth2RequestError } from 'arctic';
import { generateId } from 'lucia';
import type { RequestHandler } from './$types';
import { getOauthAccount, insertOauthAccount } from '$lib/server/handlers';

const providerId = 'github';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const storedState = cookies.get('oauth_state') ?? null;
	if (!code || !state || !storedState || state !== storedState) {
		return new Response(null, {
			status: 400,
		});
	}

	try {
		const tokens = await github.validateAuthorizationCode(code);
		const oauthUserResponse = await fetch('https://api.github.com/user', {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`,
			},
		});
		const oauthUser: GitHubUser = await oauthUserResponse.json();

		const existingUser = await getOauthAccount(providerId, String(oauthUser.id));

		if (existingUser) {
			const session = await lucia.createSession(existingUser.user.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes,
			});
		} else {
			if (!oauthUser.email) {
				// if email isn't public, request from github's email endpoint
				const oauthEmailResponse = await fetch('https://api.github.com/user/emails', {
					headers: {
						Authorization: `Bearer ${tokens.accessToken}`,
					},
				});
				const oauthEmails: { email: string; verified: boolean; primary: boolean }[] = await oauthEmailResponse.json();
				oauthUser.email =
					oauthEmails.find((email) => email.primary && email.verified)?.email ??
					oauthEmails.find((email) => email.verified)?.email ??
					null;
			}

			if (!oauthUser.email) {
				return new Response(null, {
					status: 302,
					headers: { Location: '/signup/?error=oauth-unverified-email' },
				});
			}

			const userId = generateId(15);
			const newUser = await insertOauthAccount({
				providerId: providerId,
				providerUserId: String(oauthUser.id),
				userId: userId,
				email: oauthUser.email,
				username: oauthUser.login,
			});
			const session = await lucia.createSession(newUser[0].id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes,
			});
		}
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/',
			},
		});
	} catch (e) {
		console.log({ e });
		// the specific error message depends on the provider
		if (e instanceof OAuth2RequestError) {
			// invalid code
			return new Response(null, {
				status: 400,
			});
		} else if (e instanceof Error && e.message === 'Unverified email') {
			return new Response(null, {
				status: 302,
				headers: { Location: '/login/?error=unverified-email' },
			});
		}
		return new Response(null, {
			status: 500,
		});
	}
};

interface GitHubUser {
	id: string;
	login: string;
	email: string | null;
}
