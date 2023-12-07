import { ParseResultType, parseDomain } from 'parse-domain';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/lucia';
import { getDomainsForUser, insertDomain } from '$lib/server/handlers';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth?.validate();
	if (!session) throw redirect(302, '/login');

	const domains = getDomainsForUser(session.user.userId);

	// TODO: check dns for each domain
	// https://nodejs.org/api/dns.html

	return {
		userId: session.user.userId,
		username: session.user.username,
		domains,
	};
};

export const actions: Actions = {
	addDomain: async ({ locals, request }) => {
		const session = await locals.auth.validate();
		if (!session) return fail(401);
		const data = await request.formData();
		const domain = data.get('domain');

		if (!domain || typeof domain !== 'string') return fail(400, { domain, invalid: true });

		// check that this is just a domain name
		const parseResult = parseDomain(domain);
		console.log({ parseResult });
		if (![ParseResultType.Listed, ParseResultType.NotListed].includes(parseResult.type))
			return fail(400, { domain, invalid: true });

		if (parseResult.type === ParseResultType.Listed && parseResult.subDomains.length)
			return fail(400, { domain, subdomain: true });

		const inserted = await insertDomain({
			ownerId: session.user.userId,
			name: domain,
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
		throw redirect(302, '/login'); // redirect to login page
	},
};
