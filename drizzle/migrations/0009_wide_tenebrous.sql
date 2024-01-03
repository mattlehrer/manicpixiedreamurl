/*
 SQLite does not support "Dropping foreign key" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
 https://www.sqlite.org/lang_altertable.html
 
 Due to that we don't generate migration automatically and it has to be done manually
 */
--> statement-breakpoint
/*
 SQLite does not support "Creating foreign key on existing column" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
 https://www.sqlite.org/lang_altertable.html
 
 Due to that we don't generate migration automatically and it has to be done manually
 */
/* the following was run manually to add foreign key cascade info:
 
 PRAGMA writable_schema=1;
 
 UPDATE sqlite_master SET sql='CREATE TABLE `email_verification` (`id` text PRIMARY KEY NOT NULL, `user_id` text NOT NULL, `code` text, `created_at` text DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE CASCADE ON DELETE CASCADE)' WHERE type='table' AND name='email_verification';
 
 UPDATE sqlite_master SET sql='CREATE TABLE `user_session` (`id` text PRIMARY KEY NOT NULL,`user_id` text NOT NULL,`active_expires` blob NOT NULL,`idle_expires` blob NOT NULL,FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE CASCADE ON DELETE CASCADE)' WHERE type='table' AND name='user_session';
 
 UPDATE sqlite_master SET sql='CREATE TABLE `user_key` (`id` text PRIMARY KEY NOT NULL,`user_id` text NOT NULL,`hashed_password` text,FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE CASCADE ON DELETE CASCADE)' WHERE type='table' AND name='user_key';
 
 UPDATE sqlite_master SET sql='CREATE TABLE `domain` (`id` text PRIMARY KEY NOT NULL,`name` text NOT NULL,`owner_id` text NOT NULL,`is_active` integer,`created_at` text DEFAULT CURRENT_TIMESTAMP,`updated_at` text DEFAULT CURRENT_TIMESTAMP, `reason` text NOT NULL, `asking_price` integer, `bare_dns_is_verified` integer DEFAULT false, `www_dns_is_verified` integer DEFAULT false,FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON UPDATE CASCADE ON DELETE CASCADE)' WHERE type='table' AND name='domain';
 
 UPDATE sqlite_master SET sql='CREATE TABLE `idea` (`id` text PRIMARY KEY NOT NULL,`domain_id` text NOT NULL,`owner_id` text NOT NULL,`text` text NOT NULL,`created_at` text DEFAULT CURRENT_TIMESTAMP,`updated_at` text DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY (`domain_id`) REFERENCES `domain`(`id`) ON UPDATE CASCADE ON DELETE CASCADE,FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON UPDATE CASCADE ON DELETE no action)' WHERE type='table' AND name='idea';
 
 UPDATE sqlite_master SET sql='CREATE TABLE `flagged_idea` (`id` text PRIMARY KEY NOT NULL,`domain_id` text NOT NULL,`owner_id` text NOT NULL,`text` text NOT NULL,`moderation_data` text,`created_at` text DEFAULT CURRENT_TIMESTAMP,`updated_at` text DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY (`domain_id`) REFERENCES `domain`(`id`) ON UPDATE CASCADE ON DELETE no action,FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON UPDATE CASCADE ON DELETE no action)' WHERE type='table' AND name='flagged_idea';
 
 UPDATE sqlite_master SET sql='CREATE TABLE `vote` (`id` text PRIMARY KEY NOT NULL,`idea_id` text NOT NULL,`user_id` text NOT NULL,`created_at` text DEFAULT CURRENT_TIMESTAMP,`updated_at` text DEFAULT CURRENT_TIMESTAMP, `type` integer NOT NULL,FOREIGN KEY (`idea_id`) REFERENCES `idea`(`id`) ON UPDATE CASCADE ON DELETE CASCADE,FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE CASCADE ON DELETE CASCADE)' WHERE type='table' AND name='vote';
 
 PRAGMA writable_schema=RESET;
 
 */