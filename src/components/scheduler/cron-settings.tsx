import { IconCalendarClock, IconPlayerPlay } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { useTRPC } from "#/integrations/trpc/react";

const cadenceOptions = [
	{ value: "every15Minutes", label: "Every 15 minutes", cron: "*/15 * * * *" },
	{ value: "hourly", label: "Every hour", cron: "0 * * * *" },
	{ value: "every6Hours", label: "Every 6 hours", cron: "0 */6 * * *" },
	{ value: "daily", label: "Daily at 02:00", cron: "0 2 * * *" },
	{ value: "weekly", label: "Weekly on Monday at 02:00", cron: "0 2 * * 1" },
] as const;

export function CronSettings() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const settings = useQuery(trpc.scheduler.getSettings.queryOptions());
	const [cadence, setCadence] = useState("daily");
	useEffect(() => {
		if (settings.data) setCadence(settings.data.cadence);
	}, [settings.data]);

	const save = useMutation(
		trpc.scheduler.updateSettings.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries({
					queryKey: trpc.scheduler.getSettings.queryKey(),
				});
				toast.success("Cron schedule saved");
			},
			onError: (error) => toast.error(error.message),
		}),
	);
	const runNow = useMutation(
		trpc.scheduler.runNow.mutationOptions({
			onSuccess: async (result) => {
				if (result.success) {
					await queryClient.invalidateQueries({
						queryKey: trpc.scheduler.getSettings.queryKey(),
					});
					toast.success("Scheduled tasks completed");
				} else {
					toast.message(result.message);
				}
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	const selected = cadenceOptions.find((option) => option.value === cadence);
	const savedCadence = settings.data?.cadence;

	return (
		<main className="mx-auto w-full max-w-3xl space-y-6 p-6">
			<header className="space-y-2">
				<p className="text-sm font-medium text-muted-foreground">
					Settings / Automation
				</p>
				<h1 className="text-3xl font-semibold tracking-tight">Cron schedule</h1>
				<p className="text-muted-foreground">
					Control how often the server checks and runs all automated assessment
					tasks.
				</p>
			</header>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<IconCalendarClock className="size-5" /> Task frequency
					</CardTitle>
					<CardDescription>
						One shared schedule applies to every automated task. Times use
						Europe/Warsaw.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-5">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div className="space-y-1">
							<p className="font-medium">Run tasks</p>
							<p className="text-sm text-muted-foreground">
								Default: daily at 02:00. The source documents call for scheduler
								driven tasks but do not define a polling interval.
							</p>
						</div>
						<Select value={cadence} onValueChange={setCadence}>
							<SelectTrigger
								aria-label="Task frequency"
								className="w-full sm:w-64"
							>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{cadenceOptions.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="rounded-lg border bg-muted/30 p-3 text-sm">
						<div className="flex justify-between gap-3">
							<span className="text-muted-foreground">Cron expression</span>
							<code>{selected?.cron}</code>
						</div>
						<div className="mt-2 flex justify-between gap-3">
							<span className="text-muted-foreground">Last run</span>
							<span>
								{settings.data?.lastRunAt
									? new Date(settings.data.lastRunAt).toLocaleString()
									: "Not run yet"}
							</span>
						</div>
					</div>
					<div className="flex flex-wrap justify-end gap-2">
						<Button
							variant="outline"
							onClick={() => runNow.mutate()}
							disabled={runNow.isPending || settings.isLoading}
						>
							<IconPlayerPlay /> Run tasks now
						</Button>
						<Button
							onClick={() =>
								save.mutate({
									cadence: cadence as (typeof cadenceOptions)[number]["value"],
								})
							}
							disabled={
								save.isPending || settings.isLoading || cadence === savedCadence
							}
						>
							Save schedule
						</Button>
					</div>
				</CardContent>
			</Card>
			{settings.isError && (
				<p role="alert" className="text-sm text-destructive">
					{settings.error.message}. Cron settings are available to
					administrators.
				</p>
			)}
		</main>
	);
}
