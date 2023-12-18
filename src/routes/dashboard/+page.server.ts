import { ParseResultType, parseDomain } from 'parse-domain';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/lucia';
import { getDomainsForUser, insertDomain } from '$lib/server/handlers';
import { dev } from '$app/environment';
import { getDNSData } from '$lib/server/dns';

const MAX_DOMAINS = 3;

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth?.validate();
	if (!session) redirect(302, '/login');

	const domains = getDomainsForUser(session.user.userId);

	return {
		userId: session.user.userId,
		username: session.user.username,
		domains,
		dnsData: domains.then((domains) =>
			domains.map(({ id, name }) => ({
				id,
				name,
				bareDnsPromise: getDNSData(name),
				wwwDnsPromise: getDNSData(`www.${name}`),
			})),
		),
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

		const data = await request.formData();
		const domain = data.get('domain');
		const reason = data.get('reason');

		if (!domain || typeof domain !== 'string') return fail(400, { domain, invalid: true });
		if (!reason || typeof reason !== 'string') return fail(400, { reason, invalidReason: true });

		// check that this is just a domain name
		const parseResult = parseDomain(domain);
		console.log({ parseResult });
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
		console.log({ inserted });

		return { inserted };
	},
	logout: async ({ locals }) => {
		const session = await locals.auth.validate();
		if (!session) return fail(401);
		await auth.invalidateSession(session.sessionId); // invalidate session
		locals.auth.setSession(null); // remove cookie
		redirect(302, '/login'); // redirect to login page
	},
};
