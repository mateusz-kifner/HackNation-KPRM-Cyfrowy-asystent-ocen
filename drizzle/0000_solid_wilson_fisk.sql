CREATE TABLE `absences` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`starts_at` integer NOT NULL,
	`ends_at` integer NOT NULL,
	`continuous` integer DEFAULT false NOT NULL,
	`reason` text,
	`recorded_by_user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`recorded_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE TABLE `acting_substitutions` (
	`id` text PRIMARY KEY NOT NULL,
	`substitute_user_id` text NOT NULL,
	`represented_user_id` text NOT NULL,
	`scope` text NOT NULL,
	`starts_at` integer NOT NULL,
	`ends_at` integer,
	`created_by_user_id` text NOT NULL,
	FOREIGN KEY (`substitute_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`represented_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `assessment_acknowledgements` (
	`id` text PRIMARY KEY NOT NULL,
	`assessment_id` text NOT NULL,
	`type` text NOT NULL,
	`status` text NOT NULL,
	`actor_user_id` text NOT NULL,
	`acknowledged_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`explanation` text,
	FOREIGN KEY (`assessment_id`) REFERENCES `assessments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`actor_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `assessment_acknowledgements_type_idx` ON `assessment_acknowledgements` (`assessment_id`,`type`);--> statement-breakpoint
CREATE INDEX `assessment_acknowledgements_actor_idx` ON `assessment_acknowledgements` (`actor_user_id`);--> statement-breakpoint
CREATE TABLE `assessment_date_change_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`assessment_id` text NOT NULL,
	`requested_by_user_id` text NOT NULL,
	`current_date` integer,
	`proposed_date` integer NOT NULL,
	`reason` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`decided_by_user_id` text,
	`decided_at` integer,
	`decision_note` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`assessment_id`) REFERENCES `assessments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`requested_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`decided_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `assessment_date_change_requests_idx` ON `assessment_date_change_requests` (`assessment_id`,`status`);--> statement-breakpoint
CREATE TABLE `assessment_file_criteria` (
	`id` text PRIMARY KEY NOT NULL,
	`assessment_file_id` text NOT NULL,
	`catalog_criterion_id` text,
	`code` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`mandatory` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`duties` text,
	`expectations` text,
	`goals` text,
	`measurement_method` text,
	`points` integer,
	`comment` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`assessment_file_id`) REFERENCES `assessment_files`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`catalog_criterion_id`) REFERENCES `assessment_file_criterion_catalog`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "assessment_file_criteria_points_valid" CHECK("assessment_file_criteria"."points" IS NULL OR "assessment_file_criteria"."points" IN (1, 3, 5, 7, 9))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `assessment_file_criteria_code_idx` ON `assessment_file_criteria` (`assessment_file_id`,`code`);--> statement-breakpoint
CREATE TABLE `assessment_file_criterion_catalog` (
	`id` text PRIMARY KEY NOT NULL,
	`form` text NOT NULL,
	`code` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`mandatory` integer DEFAULT false NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `assessment_file_criterion_form_code_idx` ON `assessment_file_criterion_catalog` (`form`,`code`);--> statement-breakpoint
CREATE TABLE `assessment_files` (
	`id` text PRIMARY KEY NOT NULL,
	`assessment_id` text NOT NULL,
	`agency_name` text,
	`evaluated_first_name` text,
	`evaluated_last_name` text,
	`evaluated_person_type` text,
	`evaluated_organizational_unit` text,
	`evaluated_position` text,
	`evaluator_first_name` text,
	`evaluator_last_name` text,
	`evaluator_organizational_unit` text,
	`evaluator_position` text,
	`criteria_discussion_location` text,
	`criteria_discussion_date` integer,
	`criteria_discussion_evaluator_name` text,
	`criteria_discussion_employee_name` text,
	`assessment_discussion_date` integer,
	`assessment_period_start` integer,
	`assessment_period_end` integer,
	`average_points` real,
	`overall_level` text,
	`overall_outcome` text,
	`assessment_rationale` text,
	`development_plan_recommendations` text,
	`previous_assessment_outcome` text,
	`previous_assessment_level` text,
	`previous_assessment_date` integer,
	`promotion_application` text,
	`civil_service_appointment_year` integer,
	`current_civil_service_grade` integer,
	`current_grade_granted_at` integer,
	`requested_civil_service_grade` integer,
	`promotion_application_rationale` text,
	`promotion_application_location` text,
	`promotion_application_date` integer,
	`promotion_application_evaluator_name` text,
	`evaluator_signature_location` text,
	`evaluator_signed_at` integer,
	`employee_receipt_location` text,
	`employee_acknowledged_at` integer,
	`employee_receipt_name` text,
	`objection_recipient` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`assessment_id`) REFERENCES `assessments`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "assessment_files_average_points_range" CHECK("assessment_files"."average_points" IS NULL OR ("assessment_files"."average_points" >= 1 AND "assessment_files"."average_points" <= 9)),
	CONSTRAINT "assessment_files_period_valid" CHECK("assessment_files"."assessment_period_start" IS NULL OR "assessment_files"."assessment_period_end" IS NULL OR "assessment_files"."assessment_period_start" <= "assessment_files"."assessment_period_end"),
	CONSTRAINT "assessment_files_grade_range" CHECK(("assessment_files"."current_civil_service_grade" IS NULL OR "assessment_files"."current_civil_service_grade" BETWEEN 1 AND 9) AND ("assessment_files"."requested_civil_service_grade" IS NULL OR "assessment_files"."requested_civil_service_grade" BETWEEN 1 AND 9))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `assessment_files_assessment_idx` ON `assessment_files` (`assessment_id`);--> statement-breakpoint
CREATE TABLE `assessment_history` (
	`id` text PRIMARY KEY NOT NULL,
	`assessment_id` text NOT NULL,
	`actor_user_id` text,
	`action` text NOT NULL,
	`reason` text,
	`before_value` text,
	`after_value` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`assessment_id`) REFERENCES `assessments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`actor_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `assessment_history_assessment_idx` ON `assessment_history` (`assessment_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `assessments` (
	`id` text PRIMARY KEY NOT NULL,
	`evaluated_user_id` text NOT NULL,
	`evaluator_user_id` text NOT NULL,
	`appointed_by_user_id` text,
	`form` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`period_start` integer,
	`period_end` integer,
	`criteria_discussion_at` integer,
	`assessment_date` integer,
	`assessment_discussion_at` integer,
	`due_at` integer,
	`submitted_at` integer,
	`completed_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`evaluated_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`evaluator_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`appointed_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "assessments_distinct_participants" CHECK("assessments"."evaluated_user_id" <> "assessments"."evaluator_user_id"),
	CONSTRAINT "assessments_valid_period" CHECK("assessments"."period_start" IS NULL OR "assessments"."period_end" IS NULL OR "assessments"."period_start" <= "assessments"."period_end")
);
--> statement-breakpoint
CREATE INDEX `assessments_evaluated_user_idx` ON `assessments` (`evaluated_user_id`);--> statement-breakpoint
CREATE INDEX `assessments_evaluator_idx` ON `assessments` (`evaluator_user_id`);--> statement-breakpoint
CREATE INDEX `assessments_status_due_idx` ON `assessments` (`status`,`due_at`);--> statement-breakpoint
CREATE TABLE `employees` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`position` text NOT NULL,
	`department` text NOT NULL,
	`hire_date` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `employees_email_unique` ON `employees` (`email`);--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`type` text DEFAULT 'info' NOT NULL,
	`href` text,
	`read_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `reporting_lines` (
	`id` text PRIMARY KEY NOT NULL,
	`employee_user_id` text NOT NULL,
	`manager_user_id` text NOT NULL,
	`starts_at` integer NOT NULL,
	`ends_at` integer,
	`created_by_user_id` text NOT NULL,
	FOREIGN KEY (`employee_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`manager_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `scheduler_settings` (
	`id` text PRIMARY KEY DEFAULT 'global' NOT NULL,
	`cron_expression` text DEFAULT '0 2 * * *' NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`last_run_at` integer,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE TABLE `todos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`is_anonymous` integer DEFAULT false,
	`role` text DEFAULT 'Employee' NOT NULL,
	`position` text,
	`department` text,
	`organizational_unit` text,
	`employment_status` text,
	`employment_type` text,
	`hire_date` integer,
	`deactivated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `user_audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`actor_id` text NOT NULL,
	`action` text NOT NULL,
	`changes` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);