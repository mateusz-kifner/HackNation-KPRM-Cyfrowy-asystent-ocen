import { IconCalendarClock } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
	return (
		<main className="mx-auto w-full max-w-3xl space-y-6 p-6">
			<header className="space-y-2">
				<h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
				<p className="text-muted-foreground">Configure application behavior.</p>
			</header>
			<Link
				to="/settings/cron"
				className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			>
				<Card className="transition-colors hover:bg-muted/40">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<IconCalendarClock className="size-5" /> Automated task schedule
						</CardTitle>
						<CardDescription>
							Set how often cron tasks run, including assessment reminders.
						</CardDescription>
					</CardHeader>
				</Card>
			</Link>
		</main>
	);
}
