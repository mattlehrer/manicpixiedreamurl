ALTER TABLE domain ADD `bare_dns_is_verified` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE domain ADD `www_dns_is_verified` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `domain` DROP COLUMN `is_dns_verified`;