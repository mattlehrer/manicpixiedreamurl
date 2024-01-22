import { deleteEmailVerificationCode, getEmailVerificationCode, updateUser } from '$lib/server/handlers';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { analytics } from '$lib/server/analytics';

export const load: PageServerLoad = async ({ url }) => {
	const code = url.searchParams.get('code');
	if (!code) redirect(302, '/');

	const user = await getEmailVerificationCode(code);
	if (!user) return { error: 'Invalid code' };

	await deleteEmailVerificationCode(code);

	const updates = await updateUser(user.userId, { hasVerifiedEmail: true });
	if (!updates.changes) return { error: 'Failed to update user' };

	analytics.track({
		userId: user.userId,
		event: 'Email Verified',
	});

	return { success: true };
};
