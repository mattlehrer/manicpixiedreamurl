import { relations, sql } from 'drizzle-orm';
import { text, sqliteTable, blob, integer, unique, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';
import { uid } from 'uid/secure';

const createVerificationCode = () => uid(64);

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	email: text('email').notNull().unique(),
	username: text('username').notNull().unique(),
	hasVerifiedEmail: integer('has_verified_email', { mode: 'boolean' }).default(false),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
	// other user attributes
});

export const userRelations = relations(user, ({ many }) => ({
	domain: many(domain),
	ideas: many(idea),
	flaggedIdeas: many(flaggedIdea),
	votes: many(vote),
}));

export const emailVerificationCode = sqliteTable('email_verification', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => createId()),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	code: text('code').$defaultFn(() => createVerificationCode()),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const emailVerificationRelations = relations(emailVerificationCode, ({ one }) => ({
	user: one(user, {
		fields: [emailVerificationCode.userId],
		references: [user.id],
	}),
}));

export const session = sqliteTable('user_session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	activeExpires: blob('active_expires', {
		mode: 'bigint',
	}).notNull(),
	idleExpires: blob('idle_expires', {
		mode: 'bigint',
	}).notNull(),
});

export const key = sqliteTable('user_key', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	hashedPassword: text('hashed_password'),
});

export const domain = sqliteTable(
	'domain',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => createId()),
		name: text('name').notNull().unique(),
		ownerId: text('owner_id')
			.notNull()
			.references(() => user.id),
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
		.references(() => domain.id),
	ownerId: text('owner_id')
		.notNull()
		.references(() => user.id),
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
		.references(() => domain.id),
	ownerId: text('owner_id')
		.notNull()
		.references(() => user.id),
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
		type: integer('type', { mode: 'number' }).notNull(), // +1, -1, 0 (or deleted?)
		ideaId: text('idea_id')
			.notNull()
			.references(() => idea.id),
		userId: text('user_id')
			.notNull()
			.references(() => user.id),
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
