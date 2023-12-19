import { domain, emailVerificationCode, user } from '$lib/schema';
import { eq } from 'drizzle-orm';
import { db } from './db';

export type User = typeof user.$inferSelect;

export const updateUser = (userId: string, data: Partial<User>) => {
	return db.update(user).set(data).where(eq(user.id, userId));
};

export const insertEmailVerificationCode = (userId: string) => {
	return db.insert(emailVerificationCode).values({ userId }).returning({ code: emailVerificationCode.code });
};

export const getEmailVerificationCode = (code: string) => {
	return db.select().from(emailVerificationCode).where(eq(emailVerificationCode.code, code));
};

export const deleteEmailVerificationCode = (code: string) => {
	return db.delete(emailVerificationCode).where(eq(emailVerificationCode.code, code));
};

export type Domain = typeof domain.$inferInsert;

export const insertDomain = (newDomain: Domain) => {
	return db.insert(domain).values(newDomain);
};

export const updateDomain = (domainId: string, data: Partial<Domain>) => {
	return db.update(domain).set(data).where(eq(domain.id, domainId));
};

export const getDomainsForUser = (ownerId: string) => {
	return db.select().from(domain).where(eq(domain.ownerId, ownerId));
};

export const getDomainByName = async (input: string) => {
	const name = input.toLowerCase().replace(/^www\./, '');
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
