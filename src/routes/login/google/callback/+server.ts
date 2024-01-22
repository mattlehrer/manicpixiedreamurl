import { google } from '$lib/server/auth';
import { lucia } from '$lib/server/lucia';
import { OAuth2RequestError } from 'arctic';
import { generateId } from 'lucia';
import type { RequestHandler } from './$types';
import { getOauthAccount, insertOauthAccount } from '$lib/server/handlers';

const providerId = 'google';

export const GET: RequestHandler = async ({ url, cookies, locals }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const storedState = cookies.get('oauth_state') ?? null;
	const storedCodeVerifier = cookies.get('code_verifier') ?? null;
	if (!code || !state || !storedState || !storedCodeVerifier || state !== storedState) {
		locals.message = 'Invalid state or code';
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/login',
			},
		});
	}

	try {
		const tokens = await google.validateAuthorizationCode(code, storedCodeVerifier);

		const oauthUserResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`,
			},
		});

		const oauthUser: GoogleUser = await oauthUserResponse.json();

		const existingUser = await getOauthAccount(providerId, String(oauthUser.sub));

		if (existingUser) {
			const session = await lucia.createSession(existingUser.user.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes,
			});
		} else {
			const userId = generateId(15);
			const newUser = await insertOauthAccount({
				providerId,
				providerUserId: String(oauthUser.sub),
				userId: userId,
				email: oauthUser.email,
				username: oauthUser.name.replaceAll(' ', '_'),
			});
			console.log({ newUser });
			if (!newUser || !newUser[0].id) {
				return new Response(null, {
					status: 500,
				});
			}
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

interface GoogleUser {
	sub: string;
	name: string;
	email: string;
	email_verified: boolean;
}
