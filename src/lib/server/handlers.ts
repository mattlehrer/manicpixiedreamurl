import {
	domain,
	emailVerificationCode,
	flaggedIdea,
	idea,
	oauthAccount,
	password,
	passwordResetToken,
	user,
	vote,
} from '$lib/schema';
import { and, desc, eq, not, sql } from 'drizzle-orm';
import { db } from './db';
import type { isProhibitedTextWithReasons } from './moderation';
import type { ProviderId } from './auth';
import { generateId } from 'lucia';

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export const insertUser = (newUser: NewUser) => {
	return db.insert(user).values(newUser).returning({ id: user.id });
};

export const getUserByUsernameWithPassword = (username: string) => {
	return db.query.user.findFirst({
		where: (user, { eq }) => eq(user.username, username.toLowerCase()),
		with: {
			password: {
				columns: {
					hashedPassword: true,
				},
			},
		},
	});
};

export const getUserByEmail = (email: string) => {
	return db.query.user.findFirst({
		where: (user, { eq }) => eq(user.email, email.toLowerCase()),
	});
};

export const updateUser = (userId: string, data: Partial<User>) => {
	return db
		.update(user)
		.set({ ...data, updatedAt: sql`CURRENT_TIMESTAMP` })
		.where(eq(user.id, userId));
};

export const getOauthAccount = (providerId: ProviderId, providerUserId: string) => {
	return db.query.oauthAccount.findFirst({
		where: (oauthAccount, { and, eq }) =>
			and(eq(oauthAccount.providerId, providerId), eq(oauthAccount.providerUserId, providerUserId)),
		with: {
			user: true,
		},
	});
};

export const insertOauthAccount = async ({
	providerId,
	providerUserId,
	userId,
	email,
	username,
}: {
	providerId: ProviderId;
	providerUserId: string;
	userId: string;
	email: string;
	username: string;
}) => {
	const existingEmail = await getUserByEmail(email);
	if (existingEmail) {
		if (existingEmail.hasVerifiedEmail) {
			return db
				.insert(oauthAccount)
				.values({ providerId, providerUserId, userId: existingEmail.id })
				.returning({ id: user.id });
		} else {
			throw new Error('Unverified email');
		}
	} else {
		const existingUsername = await db.query.user.findFirst({
			where: (user, { eq }) => eq(user.username, username.toLowerCase()),
		});
		if (existingUsername) {
			// use a random username
			username = `${username}-${generateId(5)}`;
		}
		await db.transaction(async (tx) => {
			await tx.insert(user).values({ id: userId, email, username, hasVerifiedEmail: true });
			await tx.insert(oauthAccount).values({ providerId, providerUserId, userId });
		});
		return [{ id: userId }];
	}
};

export const insertPassword = (newPassword: { userId: string; hashedPassword: string }) => {
	return db.insert(password).values(newPassword);
};

export const upsertPassword = (values: { userId: string; hashedPassword: string }) => {
	return db
		.insert(password)
		.values({ ...values })
		.onConflictDoUpdate({
			target: password.userId,
			set: { hashedPassword: values.hashedPassword, updatedAt: sql`CURRENT_TIMESTAMP` },
		});
};

export const getPassword = (userId: string) => {
	return db.query.password.findFirst({
		where: (password, { eq }) => eq(password.userId, userId),
	});
};

export const insertEmailVerificationCode = (userId: string) => {
	return db.insert(emailVerificationCode).values({ userId }).returning({ code: emailVerificationCode.code });
};

export const getEmailVerificationCode = (code: string) => {
	return db.query.emailVerificationCode.findFirst({
		where: (emailVerificationCode, { eq }) => eq(emailVerificationCode.code, code),
	});
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

export const insertPasswordResetToken = (userId: string) => {
	return db.insert(passwordResetToken).values({ userId }).returning({ token: passwordResetToken.token });
};

export const getPasswordResetTokenWithUser = (token: string) => {
	return db.query.passwordResetToken.findFirst({
		where: (passwordResetToken, { eq }) => eq(passwordResetToken.token, token),
		with: {
			user: true,
		},
	});
};

export const deletePasswordResetToken = (token: string) => {
	return db.delete(passwordResetToken).where(eq(passwordResetToken.token, token));
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

export const getDomainById = async (id: string) => {
	return db.query.domain.findFirst({
		where: (domain, { and, eq }) => and(eq(domain.id, id), eq(domain.isActive, true)),
	});
};

export const getRandomDomains = async (limit: number, domainId: string = '') => {
	const domains = await db.query.domain.findMany({
		limit,
		orderBy: [sql`RANDOM()`],
		where: (domain, { eq }) =>
			and(eq(domain.isActive, true), eq(domain.bareDNSisVerified, true), not(eq(domain.id, domainId))),
		columns: {
			id: true,
			name: true,
			reason: true,
			isActive: true,
		},
		with: {
			ideas: {
				columns: {
					text: true,
					updatedAt: true,
				},
				with: {
					votes: {
						columns: {
							type: true,
							updatedAt: true,
						},
					},
				},
			},
		},
	});

	return domains.map((domain) => {
		const ideaScores = domain.ideas
			.map((idea) => {
				const score = idea.votes.reduce((acc, vote) => acc + vote.type, 0);
				return { text: idea.text, updatedAt: idea.updatedAt, score };
			})
			.sort((a, b) => b.score - a.score);
		return { ...domain, ideas: ideaScores };
	});
};

export const insertIdea = async ({ domainId, ownerId, text }: { domainId: string; ownerId: string; text: string }) => {
	const insertedIdea = await db.insert(idea).values({ domainId, ownerId, text }).returning({ id: idea.id });
	await insertUpVote({ ideaId: insertedIdea[0].id, userId: ownerId });
	return insertedIdea;
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
