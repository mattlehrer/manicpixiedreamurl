ALTER TABLE domain ADD `reason` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `email_idx` ON `domain` (`name`);