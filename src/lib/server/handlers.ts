import { domain, emailVerificationCode, idea, user } from '$lib/schema';
import { desc, eq } from 'drizzle-orm';
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

export const getAllEmailVerificationCodesForUser = (userId: string) => {
	return db
		.select()
		.from(emailVerificationCode)
		.where(eq(emailVerificationCode.userId, userId))
		.orderBy(desc(emailVerificationCode.createdAt));
};

export const deleteAllEmailVerificationCodesForUser = (userId: string) => {
	return db.delete(emailVerificationCode).where(eq(emailVerificationCode.userId, userId));
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
			id: true,
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

export const insertIdea = async ({ domainId, ownerId, text }: { domainId: string; ownerId: string; text: string }) => {
	return db.insert(idea).values({ domainId, ownerId, text });
};

export const getIdeaForDomainByText = async (domainId: string, text: string) => {
	return db.query.idea.findFirst({
		where: (idea, { and, eq }) => and(eq(idea.domainId, domainId), eq(idea.text, text)),
	});
};

export const getIdeasWithVotesForDomainId = async (domainId: string) => {
	return db.query.idea.findMany({
		where: (idea, { eq }) => eq(idea.domainId, domainId),
		columns: {
			id: true,
			text: true,
		},
		with: {
			votes: true,
		},
	});
};
