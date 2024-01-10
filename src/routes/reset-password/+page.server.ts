import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import isEmail from 'validator/lib/isEmail';
import { getUserByEmail } from '$lib/server/handlers';
import { sendPasswordResetEmail } from '$lib/server/email';

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		const email = formData.get('email');

		if (typeof email !== 'string' || email.length < 3 || email.length > 255 || !isEmail(email)) {
			return fail(400, {
				email,
				invalidEmail: true,
			});
		}

		/**
		 * 1. get user by email
		 * 2. if no user, return success
		 * 3. if user, create token & send email
		 */

		const existingUser = await getUserByEmail(email);
		if (!existingUser) {
			console.log(`Password reset request for email ${email} but no user found`);
			return { success: true };
		}

		try {
			await sendPasswordResetEmail(existingUser);
		} catch (error) {
			console.log(error);
			return fail(500, { serverError: true });
		}

		return { success: true };
	},
};
