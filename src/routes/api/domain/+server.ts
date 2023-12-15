import { domain } from '$lib/schema';
import { db } from '$lib/server/db';
import { eq, sql } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	const { domainId, domainReason } = await request.json();

	const updatedId = await db
		.update(domain)
		// TODO: need to add triggers to db instead of manual updatedAt change
		.set({ reason: domainReason, updatedAt: sql`CURRENT_TIMESTAMP` })
		.where(eq(domain.id, domainId))
		.returning({ id: domain.id });
	return json(updatedId);
};
