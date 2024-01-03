import { ParseResultType, parseDomain } from 'parse-domain';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/lucia';
import { deleteDomain, getDomainsForUser, insertDomain } from '$lib/server/handlers';
import { dev } from '$app/environment';
import { sendVerificationEmail } from '$lib/server/email';

const MAX_DOMAINS = 3;

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth?.validate();
	if (!session) redirect(302, '/login');

	const domains = await getDomainsForUser(session.user.userId);

	return {
		userId: session.user.userId,
		username: session.user.username,
		hasVerifiedEmail: session.user.hasVerifiedEmail,
		domains,
		maxDomains: MAX_DOMAINS,
	};
};

export const actions: Actions = {
	addDomain: async ({ locals, request }) => {
		const session = await locals.auth.validate();
		if (!session) return fail(401);

		// check if user is allowed to add domains
		const domains = await getDomainsForUser(session.user.userId);
		if (domains.length >= MAX_DOMAINS) return fail(400, { tooMany: MAX_DOMAINS });
		if (!domains.every((d) => d.bareDNSisVerified && d.wwwDNSisVerified)) return fail(400, { dnsNotVerified: true });

		const data = await request.formData();
		const domain = data.get('domain');
		const reason = data.get('reason');

		if (!domain || typeof domain !== 'string') return fail(400, { domain, invalid: true });
		if (!reason || typeof reason !== 'string') return fail(400, { reason, invalidReason: true });

		// check that this is just a domain name
		const parseResult = parseDomain(domain);
		if (!dev && ![ParseResultType.Listed, ParseResultType.NotListed].includes(parseResult.type))
			return fail(400, { domain, invalid: true });

		if (parseResult.type === ParseResultType.Listed && parseResult.subDomains.length)
			return fail(400, { domain, subdomain: true });

		const inserted = await insertDomain({
			ownerId: session.user.userId,
			name: domain,
			reason,
			isActive: true,
		});

		return { inserted };
	},
	deleteDomain: async ({ locals, request }) => {
		const session = await locals.auth.validate();
		if (!session) return fail(401);

		const data = await request.formData();
		const domainId = data.get('domainId');

		if (!domainId || typeof domainId !== 'string') return fail(400, { domainId, invalid: true });

		try {
			const deleted = await deleteDomain(domainId, session.user.userId);
			console.log({ deleted });
			return { deleted };
		} catch (error) {
			console.error(error);
			return fail(500, { error: true });
		}
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
	logout: async ({ locals }) => {
		const session = await locals.auth.validate();
		if (session) {
			await auth.invalidateSession(session.sessionId); // invalidate session
		}
		locals.auth.setSession(null); // remove cookie
		await auth.deleteDeadUserSessions(session?.user?.userId); // cleanup sessions

		redirect(302, '/login'); // redirect to login page
	},
};
