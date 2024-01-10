import { ParseResultType, parseDomain } from 'parse-domain';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { deleteDomain, getDomainsForUser, insertDomain } from '$lib/server/handlers';
import { dev } from '$app/environment';
import { sendVerificationEmail } from '$lib/server/email';
import { lucia } from '$lib/server/lucia';

const MAX_DOMAINS = 3;

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.session || !locals.user) redirect(302, '/login');

	const domains = await getDomainsForUser(locals.user.id);

	return {
		userId: locals.user.id,
		username: locals.user.username,
		hasVerifiedEmail: locals.user.hasVerifiedEmail,
		domains,
		maxDomains: MAX_DOMAINS,
	};
};

export const actions: Actions = {
	addDomain: async ({ locals, request }) => {
		if (!locals.session || !locals.user) return fail(401);

		// check if user is allowed to add domains
		const domains = await getDomainsForUser(locals.user.id);
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

		try {
			await insertDomain({
				ownerId: locals.user.id,
				name: domain,
				reason,
				isActive: true,
			});

			return { inserted: true };
		} catch (error) {
			console.error(error);
			return fail(500, { dbError: true });
		}
	},
	deleteDomain: async ({ locals, request }) => {
		if (!locals.session) return fail(401);

		const data = await request.formData();
		const domainId = data.get('domainId');

		if (!domainId || typeof domainId !== 'string') return fail(400, { domainId, invalid: true });

		try {
			const deleted = await deleteDomain(domainId, locals.session.userId);
			console.log({ deleted });
			return { deleted };
		} catch (error) {
			console.error(error);
			return fail(500, { error: true });
		}
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

		return { sent: true };
	},
	logout: async ({ locals, cookies }) => {
		if (!locals.session) {
			return fail(401);
		}
		await lucia.invalidateSession(locals.session.id);
		const sessionCookie = lucia.createBlankSessionCookie();
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '/',
			...sessionCookie.attributes,
		});
		return redirect(302, '/login');
	},
};
