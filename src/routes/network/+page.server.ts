import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
	addDomain: async ({ locals, request }) => {
		const session = await locals.auth.validate();
		if (!session) return fail(401);

		// // check if user is allowed to add domains
		// const domains = await getDomainsForUser(session.user.userId);
		// if (domains.length >= MAX_DOMAINS) return fail(400, { tooMany: MAX_DOMAINS });
		// if (!domains.every((d) => d.bareDNSisVerified && d.wwwDNSisVerified)) return fail(400, { dnsNotVerified: true });

		// const data = await request.formData();
		// const domain = data.get('domain');
		// const reason = data.get('reason');

		// if (!domain || typeof domain !== 'string') return fail(400, { domain, invalid: true });
		// if (!reason || typeof reason !== 'string') return fail(400, { reason, invalidReason: true });

		// // check that this is just a domain name
		// const parseResult = parseDomain(domain);
		// console.log({ parseResult });
		// if (!dev && ![ParseResultType.Listed, ParseResultType.NotListed].includes(parseResult.type))
		// 	return fail(400, { domain, invalid: true });

		// if (parseResult.type === ParseResultType.Listed && parseResult.subDomains.length)
		// 	return fail(400, { domain, subdomain: true });

		// const inserted = await insertDomain({
		// 	ownerId: session.user.userId,
		// 	name: domain,
		// 	reason,
		// 	isActive: true,
		// });
		// console.log({ inserted });

		// return { inserted };
	},
};
