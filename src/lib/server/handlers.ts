import { domain } from '$lib/schema';
import { eq } from 'drizzle-orm';
import { db } from './db';

export type NewDomain = typeof domain.$inferInsert;

export const insertDomain = (newDomain: NewDomain) => {
	return db.insert(domain).values(newDomain);
};

export const getDomainsForUser = (ownerId: string) => {
	return db.select().from(domain).where(eq(domain.ownerId, ownerId));
};

export const getDomainByName = async (name: string) => {
	return db.query.domain.findFirst({
		where: (domain, { and, eq }) => and(eq(domain.name, name), eq(domain.isActive, true)),
		columns: {
			name: true,
			reason: true,
			isActive: true,
		},
		with: {
			owner: {
				columns: {
					username: true,
				},
			},
		},
	});
};
