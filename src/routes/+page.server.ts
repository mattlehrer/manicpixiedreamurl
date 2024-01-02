import {
	getDomainByName,
	getIdeaForDomainByText,
	insertDownVote,
	insertFlaggedIdea,
	insertIdea,
	insertUpVote,
	removeVote,
} from '$lib/server/handlers';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { dashboardSites } from '$lib/config';
import { sendVerificationEmail } from '$lib/server/email';
import { isProhibitedTextWithReasons } from '$lib/server/moderation';

export const actions: Actions = {
	addSuggestion: async ({ url, locals, request }) => {
		const session = await locals.auth.validate();
		const data = await request.formData();
		const idea = data && data.get('idea');

		if (!session) {
			const redirectTo = new URL('/signup', dashboardSites[0]);
			redirectTo.searchParams.append('redirect', url.host);
			if (idea && typeof idea === 'string') redirectTo.searchParams.append('idea', idea);
			redirect(302, redirectTo);
		}

		if (!session.user.hasVerifiedEmail) {
			const redirectTo = new URL('/dashboard', dashboardSites[0]);
			return redirect(302, redirectTo);
		}

		const domain = url.hostname;
		const domainExists = await getDomainByName(domain);
		if (!domainExists) return fail(404, { message: 'Not found' });
		const domainId = domainExists.id;

		if (!domainId || typeof domainId !== 'string') error(404, { message: 'Not found' });
		if (!idea || typeof idea !== 'string' || !idea.trim() || idea.length <= 5)
			return fail(400, { idea, invalid: true });

		const newIdea = idea.trim();

		const ideaExists = await getIdeaForDomainByText(domainId, newIdea);
		if (ideaExists) return fail(400, { notUnique: 'Idea already exists' });

		try {
			const { flagged, ...reasons } = await isProhibitedTextWithReasons(newIdea);

			if (flagged) {
				console.log({ newIdea, flagged, reasons });
				await insertFlaggedIdea({
					ownerId: session.user.userId,
					domainId,
					text: newIdea,
					moderationData: { ...reasons, flagged },
				});
				const reason = Object.entries(reasons.categories).filter(([, bool]) => bool)[0][0];
				return fail(400, { flagged: reason });
			}
		} catch (error) {
			console.error(error);
		}

		const inserted = await insertIdea({
			ownerId: session.user.userId,
			domainId,
			text: newIdea,
		});

		return { inserted };
	},
	downvote: async ({ url, locals, request }) => {
		const session = await locals.auth.validate();
		const data = await request.formData();
		const ideaId = data && data.get('idea');

		if (!session) {
			const redirectTo = new URL('/signup', dashboardSites[0]);
			redirectTo.searchParams.append('redirect', url.host);
			if (ideaId && typeof ideaId === 'string') redirectTo.searchParams.append('downvote', ideaId);
			redirect(302, redirectTo);
		}

		if (!session.user.hasVerifiedEmail) {
			// TODO: add toast to verify email with link to dashboard to resend
			const redirectTo = new URL('/dashboard', dashboardSites[0]);
			return redirect(302, redirectTo);
		}

		if (!ideaId || typeof ideaId !== 'string') return fail(400, { message: 'Invalid request' });

		const inserted = await insertDownVote({
			userId: session.user.userId,
			ideaId,
		});

		return { inserted };
	},
	upvote: async ({ url, locals, request }) => {
		const session = await locals.auth.validate();
		const data = await request.formData();
		const ideaId = data && data.get('idea');

		if (!session) {
			console.log({ redirecting: true, session });
			const redirectTo = new URL('/signup', dashboardSites[0]);
			redirectTo.searchParams.append('redirect', url.host);
			if (ideaId && typeof ideaId === 'string') redirectTo.searchParams.append('upvote', ideaId);
			redirect(302, redirectTo);
		}

		if (!session.user.hasVerifiedEmail) {
			// TODO: add toast to verify email with link to dashboard to resend
			const redirectTo = new URL('/dashboard', dashboardSites[0]);
			return redirect(302, redirectTo);
		}

		if (!ideaId || typeof ideaId !== 'string') return fail(400, { message: 'Invalid request' });

		const inserted = await insertUpVote({
			userId: session.user.userId,
			ideaId,
		});

		return { inserted };
	},
	unvote: async ({ url, locals, request }) => {
		const session = await locals.auth.validate();
		const data = await request.formData();
		const ideaId = data && data.get('idea');

		if (!session) {
			console.log({ redirecting: true, session });
			const redirectTo = new URL('/signup', dashboardSites[0]);
			redirectTo.searchParams.append('redirect', url.host);
			redirect(302, redirectTo);
		}

		if (!ideaId || typeof ideaId !== 'string') return fail(400, { message: 'Invalid request' });

		const inserted = await removeVote({
			userId: session.user.userId,
			ideaId,
		});

		return { inserted };
	},
	resendVerification: async ({ locals }) => {
		const session = await locals.auth.validate();
		if (!session) return fail(401);
		if (session.user.hasVerifiedEmail) return fail(400, { alreadyVerified: true });

		let error;
		await sendVerificationEmail({ email: session.user.email, id: session.user.userId }).catch((e) => {
			console.error(e);
			error = e;
		});
		if (error) return fail(500, { verificationError: true });

		return { sent: true };
	},
};
