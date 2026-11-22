import { createFileRoute } from "@tanstack/react-router";
import { CronSettings } from "#/components/scheduler/cron-settings";

export const Route = createFileRoute("/settings/cron")({
	component: CronSettings,
});
