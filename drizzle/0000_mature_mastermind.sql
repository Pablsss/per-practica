CREATE TABLE `attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`exam_id` text NOT NULL,
	`answers` text NOT NULL,
	`started_at` text NOT NULL,
	`finished_at` text,
	`duration` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'in_progress' NOT NULL,
	`correct` integer,
	`passed` integer
);
--> statement-breakpoint
CREATE INDEX `attempts_user` ON `attempts` (`user_id`,`started_at`);