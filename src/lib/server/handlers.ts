import { domain, emailVerificationCode, flaggedIdea, idea, user, vote } from '$lib/schema';
import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from './db';
import type { isProhibitedTextWithReasons } from './moderation';

export type User = typeof user.$inferSelect;

export const updateUser = (userId: string, data: Partial<User>) => {
	return db
		.update(user)
		.set({ ...data, updatedAt: sql`CURRENT_TIMESTAMP` })
		.where(eq(user.id, userId));
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
	return db
		.update(domain)
		.set({ ...data, updatedAt: sql`CURRENT_TIMESTAMP` })
		.where(eq(domain.id, domainId));
};

export const deleteDomain = (domainId: (typeof domain.$inferSelect)['id'], ownerId: User['id']) => {
	return db.delete(domain).where(and(eq(domain.id, domainId), eq(domain.ownerId, ownerId)));
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
	});
};

export const insertIdea = async ({ domainId, ownerId, text }: { domainId: string; ownerId: string; text: string }) => {
	return db.insert(idea).values({ domainId, ownerId, text });
};

export const insertFlaggedIdea = async ({
	domainId,
	ownerId,
	text,
	moderationData,
}: {
	domainId: string;
	ownerId: string;
	text: string;
	moderationData: Awaited<ReturnType<typeof isProhibitedTextWithReasons>>;
}) => {
	return db.insert(flaggedIdea).values({ domainId, ownerId, text, moderationData });
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

export const insertUpVote = async ({ ideaId, userId }: { ideaId: string; userId: string }) => {
	return db
		.insert(vote)
		.values({ ideaId, userId, type: 1 })
		.onConflictDoUpdate({ target: [vote.ideaId, vote.userId], set: { type: 1, updatedAt: sql`CURRENT_TIMESTAMP` } });
};

export const insertDownVote = async ({ ideaId, userId }: { ideaId: string; userId: string }) => {
	return db
		.insert(vote)
		.values({ ideaId, userId, type: -1 })
		.onConflictDoUpdate({ target: [vote.ideaId, vote.userId], set: { type: -1, updatedAt: sql`CURRENT_TIMESTAMP` } });
};

export const removeVote = async ({ ideaId, userId }: { ideaId: string; userId: string }) => {
	return db
		.insert(vote)
		.values({ ideaId, userId, type: 0 })
		.onConflictDoUpdate({ target: [vote.ideaId, vote.userId], set: { type: 0, updatedAt: sql`CURRENT_TIMESTAMP` } });
};
