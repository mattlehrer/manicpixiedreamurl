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
