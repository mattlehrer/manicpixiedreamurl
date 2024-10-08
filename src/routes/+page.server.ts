import {
	getDomainByName,
	getIdeaForDomainByText,
	getRandomDomains,
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
				locals.message = `${newIdea} is flagged as inappropriate: ${JSON.stringify(reasons)})}`;
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

		if (!inserted) return fail(500, { message: 'Error inserting idea' });

		analytics.track({
			userId: locals.user.id,
			event: 'Added Idea',
			properties: {
				domainId: domainId,
			},
		});

		const nextDomain = (await getRandomDomains(1, domainId))[0];
		nextDomain.ideas = nextDomain.ideas.slice(0, 3);

		return { inserted, nextDomain };
	},
	anotherSuggestion: async ({ locals, request }) => {
		const data = await request.formData();
		const idea = data && data.get('idea');
		const domainId = data && data.get('domainId');

		console.log({ idea, domainId });

		if (!locals.session || !locals.user) {
			const redirectTo = new URL('/signup', dashboardSites[0]);
			redirect(302, redirectTo);
		}

		if (!locals.user.hasVerifiedEmail) {
			const redirectTo = new URL('/dashboard', dashboardSites[0]);
			return redirect(302, redirectTo);
		}

		if (!domainId || typeof domainId !== 'string') return fail(404, { message: 'Not found' });
		if (!idea || typeof idea !== 'string' || !idea.trim() || idea.length <= 5)
			return fail(400, { idea, invalid: true });

		const newIdea = idea.trim();

		const ideaExists = await getIdeaForDomainByText(domainId, newIdea);
		if (ideaExists) return fail(400, { notUnique: 'Idea already exists' });

		try {
			const { flagged, ...reasons } = await isProhibitedTextWithReasons(newIdea);

			if (flagged) {
				locals.message = `${newIdea} is flagged as inappropriate: ${JSON.stringify(reasons)})}`;
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

		if (!inserted) return fail(500, { message: 'Error inserting idea' });

		analytics.track({
			userId: locals.user.id,
			event: 'Added Idea',
			properties: {
				domainId: domainId,
			},
		});

		const nextDomain = (await getRandomDomains(1, domainId))[0];
		nextDomain.ideas = nextDomain.ideas.slice(0, 3);

		return { inserted, nextDomain };
	},
	skipDomain: async ({ locals, request }) => {
		const data = await request.formData();
		const domainId = data && data.get('domainId');

		if (!locals.session || !locals.user) {
			const redirectTo = new URL('/signup', dashboardSites[0]);
			redirect(302, redirectTo);
		}

		if (!locals.user.hasVerifiedEmail) {
			const redirectTo = new URL('/dashboard', dashboardSites[0]);
			return redirect(302, redirectTo);
		}

		const nextDomain = (await getRandomDomains(1, typeof domainId === 'string' ? domainId : undefined))[0];
		nextDomain.ideas = nextDomain.ideas.slice(0, 3);
		return { nextDomain };
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

		return { vote: inserted };
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

		return { upvote: inserted };
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

		await removeVote({
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

		return { unvote: true };
	},
	resendVerification: async ({ locals }) => {
		if (!locals.session || !locals.user) return fail(401);
		if (locals.user.hasVerifiedEmail) return fail(400, { alreadyVerified: true });

		let error;
		await sendVerificationEmail({ email: locals.user.email, id: locals.user.id }).catch((e: unknown) => {
			if (e instanceof Error) {
				locals.error = e.message;
				locals.errorStackTrace = e.stack;
			} else {
				locals.error = JSON.stringify(e);
			}
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
