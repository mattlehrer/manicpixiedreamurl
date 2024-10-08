import { domain } from '$lib/schema';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	let toCheck = url.searchParams.get('domain');
	if (!toCheck) {
		return new Response('', { status: 400 });
	}

	if (['manicpixiedreamurl.com', 'www.manicpixiedreamurl.com'].includes(toCheck)) {
		return new Response('', { status: 200 });
	}

	if (toCheck.startsWith('www.')) {
		toCheck = toCheck.replace('www.', '');
	}

	const exists = await db
		.select({ name: domain.name, isActive: domain.isActive })
		.from(domain)
		.where(eq(domain.name, toCheck));

	if (exists && exists.length > 0 && exists[0].isActive) {
		return new Response();
	} else {
		return new Response('', { status: 404 });
	}
};
