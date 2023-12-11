DROP INDEX IF EXISTS `email_idx`;--> statement-breakpoint
CREATE UNIQUE INDEX `name_idx` ON `domain` (`name`);