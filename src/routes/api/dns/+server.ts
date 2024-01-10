import { getDNSData } from '$lib/server/dns';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { aRecord } from '$lib/config';
import { getDomainById, updateDomain } from '$lib/server/handlers';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.session) return error(401);

	const { domain, id } = await request.json();
	if (!domain || typeof domain !== 'string') return error(400, { message: 'Bad domain' });

	const d = await getDomainById(id);
	if (!d) return error(404, { message: 'Not found' });
	if (d.name !== domain && d.name !== domain.replace(/^www\./, '')) return error(400, { message: 'Forbidden' });
	if (d.ownerId !== locals.session.userId) return error(400, { message: 'Forbidden' });

	const dns = await getDNSData(domain);

	const output = {
		ok: dns.address === aRecord,
		address: dns.address,
	};

	if (output.ok) {
		const updateData: { [key: string]: boolean } = {};
		if (domain.startsWith('www.')) {
			updateData.wwwDNSisVerified = true;
		} else {
			updateData.bareDNSisVerified = true;
		}
		await updateDomain(id, updateData);
	}

	return json(output);
};
