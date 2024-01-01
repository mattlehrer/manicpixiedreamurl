CREATE TABLE `flagged_idea` (
	`id` text PRIMARY KEY NOT NULL,
	`domain_id` text NOT NULL,
	`owner_id` text NOT NULL,
	`text` text NOT NULL,
	`moderation_data` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`domain_id`) REFERENCES `domain`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
