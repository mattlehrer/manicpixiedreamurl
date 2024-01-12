import { relations, sql } from 'drizzle-orm';
import { text, sqliteTable, integer, unique, uniqueIndex, primaryKey } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';
import { uid } from 'uid/secure';
import { TimeSpan, createDate } from 'oslo';

const createVerificationCode = () => uid(64);

export const user = sqliteTable('user', {
	id: text('id').notNull().primaryKey(),
	email: text('email').notNull().unique(),
	username: text('username').notNull().unique(),
	hasVerifiedEmail: integer('has_verified_email', { mode: 'boolean' }).default(false),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
	// other user attributes
});

export const userRelations = relations(user, ({ many, one }) => ({
	oauthAccounts: many(oauthAccount),
	domain: many(domain),
	ideas: many(idea),
	flaggedIdeas: many(flaggedIdea),
	votes: many(vote),
	password: one(password, {
		fields: [user.id],
		references: [password.userId],
	}),
}));

export const oauthAccount = sqliteTable(
	'oauth_account',
	{
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
		providerId: text('provider_id').notNull(),
		providerUserId: text('provider_user_id').notNull(),
		createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
		updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
	},
	(t) => ({
		pk: primaryKey({ name: 'oauth_account_pk', columns: [t.providerId, t.providerUserId] }),
	}),
);

export const oauthAccountRelations = relations(oauthAccount, ({ one }) => ({
	user: one(user, {
		fields: [oauthAccount.userId],
		references: [user.id],
	}),
}));

export const emailVerificationCode = sqliteTable('email_verification', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => createId()),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
	code: text('code').$defaultFn(() => createVerificationCode()),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const emailVerificationRelations = relations(emailVerificationCode, ({ one }) => ({
	user: one(user, {
		fields: [emailVerificationCode.userId],
		references: [user.id],
	}),
}));

export const passwordResetToken = sqliteTable('password_reset_token', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => createId()),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
	token: text('token').$defaultFn(() => createVerificationCode()),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
	expiresAt: text('expires_at')
		.notNull()
		.$defaultFn(() => String(createDate(new TimeSpan(2, 'h')))),
});

export const passwordResetTokenRelations = relations(passwordResetToken, ({ one }) => ({
	user: one(user, {
		fields: [passwordResetToken.userId],
		references: [user.id],
	}),
}));

export const session = sqliteTable('session', {
	id: text('id').notNull().primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
	expiresAt: integer('expires_at').notNull(),
});

export const password = sqliteTable('password', {
	userId: text('user_id')
		.notNull()
		.primaryKey()
		.unique()
		.references(() => user.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
	hashedPassword: text('hashed_password').notNull(),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const passwordRelations = relations(password, ({ one }) => ({
	user: one(user, {
		fields: [password.userId],
		references: [user.id],
	}),
}));

export const domain = sqliteTable(
	'domain',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => createId()),
		name: text('name').notNull().unique(),
		ownerId: text('owner_id')
			.notNull()
			.references(() => user.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
		reason: text('reason').notNull().default(''),
		isActive: integer('is_active', { mode: 'boolean' }),
		bareDNSisVerified: integer('bare_dns_is_verified', { mode: 'boolean' }).default(false),
		wwwDNSisVerified: integer('www_dns_is_verified', { mode: 'boolean' }).default(false),
		askingPrice: integer('asking_price'),
		createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
		updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
	},
	(table) => {
		return {
			nameIdx: uniqueIndex('name_idx').on(table.name),
		};
	},
);

export const domainRelations = relations(domain, ({ one, many }) => ({
	owner: one(user, {
		fields: [domain.ownerId],
		references: [user.id],
	}),
	ideas: many(idea),
}));

export const idea = sqliteTable('idea', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => createId()),
	domainId: text('domain_id')
		.notNull()
		.references(() => domain.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
	ownerId: text('owner_id')
		.notNull()
		// don't delete on cascade, because we want to keep the idea around
		.references(() => user.id, { onUpdate: 'cascade', onDelete: 'no action' }),
	text: text('text').notNull(),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const ideaRelations = relations(idea, ({ one, many }) => ({
	domain: one(domain, {
		fields: [idea.domainId],
		references: [domain.id],
	}),
	owner: one(user, {
		fields: [idea.ownerId],
		references: [user.id],
	}),
	votes: many(vote),
}));

export const flaggedIdea = sqliteTable('flagged_idea', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => createId()),
	domainId: text('domain_id')
		.notNull()
		.references(() => domain.id, { onUpdate: 'cascade', onDelete: 'no action' }),
	ownerId: text('owner_id')
		.notNull()
		// don't delete on cascade, because we want to keep the flagged idea around
		.references(() => user.id, { onUpdate: 'cascade', onDelete: 'no action' }),
	text: text('text').notNull(),
	moderationData: text('moderation_data', { mode: 'json' }),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const flaggedIdeaRelations = relations(flaggedIdea, ({ one }) => ({
	domain: one(domain, {
		fields: [flaggedIdea.domainId],
		references: [domain.id],
	}),
	owner: one(user, {
		fields: [flaggedIdea.ownerId],
		references: [user.id],
	}),
}));

export const vote = sqliteTable(
	'vote',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => createId()),
		type: integer('type', { mode: 'number' }).notNull(), // +1, -1, 0
		ideaId: text('idea_id')
			.notNull()
			.references(() => idea.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
		createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
		updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
	},
	(t) => ({
		unq: unique('one_vote_per_user_per_idea').on(t.ideaId, t.userId),
	}),
);

export const voteRelations = relations(vote, ({ one }) => ({
	idea: one(idea, {
		fields: [vote.ideaId],
		references: [idea.id],
	}),
	user: one(user, {
		fields: [vote.userId],
		references: [user.id],
	}),
}));
