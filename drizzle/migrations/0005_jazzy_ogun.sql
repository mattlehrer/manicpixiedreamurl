DROP INDEX IF EXISTS `one_vote_per_user_per_idea`;--> statement-breakpoint
ALTER TABLE domain ADD `is_dns_verified` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE domain ADD `asking_price` integer;--> statement-breakpoint
ALTER TABLE vote ADD `type` integer NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `one_vote_per_user_per_idea` ON `vote` (`idea_id`,`user_id`);--> statement-breakpoint
ALTER TABLE `vote` DROP COLUMN `text`;