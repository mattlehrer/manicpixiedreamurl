import { getDNSData } from '$lib/server/dns';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { aRecord } from '$lib/config';
import { updateDomain } from '$lib/server/handlers';

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.auth?.validate();
	if (!session) return error(401);

	const { domain, id } = await request.json();
	if (!domain || typeof domain !== 'string') return error(400, { message: 'Bad domain' });

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
