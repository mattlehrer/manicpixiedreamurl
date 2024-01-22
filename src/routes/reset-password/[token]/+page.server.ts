import { deletePasswordResetToken, getPasswordResetTokenWithUser, upsertPassword } from '$lib/server/handlers';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { Argon2id } from 'oslo/password';
import { isWithinExpirationDate } from 'oslo';
import { lucia } from '$lib/server/lucia';

export const actions: Actions = {
	default: async ({ request, url, cookies, locals }) => {
		const token = url.pathname.split('/').pop();
		if (!token) return fail(400, { invalidToken: true });

		const formData = await request.formData();

		const password = formData.get('password');
		const pwdConfirm = formData.get('password-confirm');

		if (password !== pwdConfirm) {
			return fail(400, {
				invalidPassword: true,
			});
		}

		if (typeof password !== 'string' || password.length < 5 || password.length > 255) {
			return fail(400, {
				invalidPassword: true,
			});
		}

		try {
			const tokenWithUser = await getPasswordResetTokenWithUser(token);

			if (!tokenWithUser || !tokenWithUser.expiresAt) return fail(400, { invalidToken: true });
			if (!isWithinExpirationDate(new Date(tokenWithUser.expiresAt))) {
				await deletePasswordResetToken(token);
				return fail(400, { invalidToken: true });
			}
			await lucia.invalidateUserSessions(tokenWithUser.user.id);
			const hashedPassword = await new Argon2id().hash(password);

			await upsertPassword({ userId: tokenWithUser.user.id, hashedPassword });
			await deletePasswordResetToken(token);

			const session = await lucia.createSession(tokenWithUser.user.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);

			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '/',
				...sessionCookie.attributes,
			});
		} catch (e: unknown) {
			if (e instanceof Error) {
				locals.error = e.message;
				locals.errorStackTrace = e.stack;
			} else {
				locals.error = JSON.stringify(e);
			}
			return fail(500, { serverError: true });
		}

		return { success: true };
	},
};
