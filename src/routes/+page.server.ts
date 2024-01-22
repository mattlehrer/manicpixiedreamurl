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
import { analytics } from '$lib/server/analytics';
import { logger } from '$lib/server/logger';

export const actions: Actions = {
	addSuggestion: async ({ url, locals, request }) => {
		const data = await request.formData();
		const idea = data && data.get('idea');

		if (!locals.session || !locals.user) {
			const redirectTo = new URL('/signup', dashboardSites[0]);
			redirectTo.searchParams.append('redirect', url.host);
			if (idea && typeof idea === 'string') redirectTo.searchParams.append('idea', idea);
			redirect(302, redirectTo);
		}

		if (!locals.user.hasVerifiedEmail) {
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
					ownerId: locals.user.id,
					domainId,
					text: newIdea,
					moderationData: { ...reasons, flagged },
				});
				const reason = Object.entries(reasons.categories).filter(([, bool]) => bool)[0][0];
				return fail(400, { flagged: reason });
			}
		} catch (error: unknown) {
			if (typeof error === 'object') {
				logger.error({ ...error, request: { requestId: locals.requestId } }, 'Error checking idea for prohibited text');
			} else {
				logger.error({ error, request: { requestId: locals.requestId } }, 'Error checking idea for prohibited text');
			}
		}

		const inserted = await insertIdea({
			ownerId: locals.user.id,
			domainId,
			text: newIdea,
		});

		analytics.track({
			userId: locals.user.id,
			event: 'Added Idea',
			properties: {
				domainId: domainId,
			},
		});

		return { inserted };
	},
	downvote: async ({ url, locals, request }) => {
		const data = await request.formData();
		const ideaId = data && data.get('idea');

		if (!locals.session || !locals.user) {
			const redirectTo = new URL('/signup', dashboardSites[0]);
			redirectTo.searchParams.append('redirect', url.host);
			if (ideaId && typeof ideaId === 'string') redirectTo.searchParams.append('downvote', ideaId);
			redirect(302, redirectTo);
		}

		if (!locals.user.hasVerifiedEmail) {
			// TODO: add toast to verify email with link to dashboard to resend
			const redirectTo = new URL('/dashboard', dashboardSites[0]);
			return redirect(302, redirectTo);
		}

		if (!ideaId || typeof ideaId !== 'string') return fail(400, { message: 'Invalid request' });

		const inserted = await insertDownVote({
			userId: locals.user.id,
			ideaId,
		});

		analytics.track({
			userId: locals.user.id,
			event: 'Downvoted Idea',
			properties: {
				ideaId,
				domain: url.host,
			},
		});

		return { inserted };
	},
	upvote: async ({ url, locals, request }) => {
		const data = await request.formData();
		const ideaId = data && data.get('idea');

		if (!locals.session || !locals.user) {
			logger.debug({ redirecting: true, request: { requestId: locals.requestId } });
			const redirectTo = new URL('/signup', dashboardSites[0]);
			redirectTo.searchParams.append('redirect', url.host);
			if (ideaId && typeof ideaId === 'string') redirectTo.searchParams.append('upvote', ideaId);
			redirect(302, redirectTo);
		}

		if (!locals.user.hasVerifiedEmail) {
			// TODO: add toast to verify email with link to dashboard to resend
			const redirectTo = new URL('/dashboard', dashboardSites[0]);
			return redirect(302, redirectTo);
		}

		if (!ideaId || typeof ideaId !== 'string') return fail(400, { message: 'Invalid request' });

		const inserted = await insertUpVote({
			userId: locals.user.id,
			ideaId,
		});

		analytics.track({
			userId: locals.user.id,
			event: 'Upvoted Idea',
			properties: {
				ideaId,
				domain: url.host,
			},
		});

		return { inserted };
	},
	unvote: async ({ url, locals, request }) => {
		const data = await request.formData();
		const ideaId = data && data.get('idea');

		if (!locals.session || !locals.user) {
			logger.debug({ redirecting: true, request: { requestId: locals.requestId } });
			const redirectTo = new URL('/signup', dashboardSites[0]);
			redirectTo.searchParams.append('redirect', url.host);
			redirect(302, redirectTo);
		}

		if (!ideaId || typeof ideaId !== 'string') return fail(400, { message: 'Invalid request' });

		const inserted = await removeVote({
			userId: locals.user.id,
			ideaId,
		});

		analytics.track({
			userId: locals.user.id,
			event: 'Removed Vote on Idea',
			properties: {
				ideaId,
				domain: url.host,
			},
		});

		return { inserted };
	},
	resendVerification: async ({ locals }) => {
		if (!locals.session || !locals.user) return fail(401);
		if (locals.user.hasVerifiedEmail) return fail(400, { alreadyVerified: true });

		let error;
		await sendVerificationEmail({ email: locals.user.email, id: locals.user.id }).catch((e) => {
			console.error(e);
			error = e;
		});
		if (error) return fail(500, { verificationError: true });

		analytics.track({
			userId: locals.user.id,
			event: 'Requested Email Verification',
		});

		return { sent: true };
	},
};
