CREATE TABLE `files` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`size` integer NOT NULL,
	`mime_type` text NOT NULL,
	`url` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`user_id` text,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
