import { randomUUID } from "node:crypto";
import type { TRPCRouterRecord } from "@trpc/server";
import { CronJob } from "cron";
import { and, eq, gte, lte, ne } from "drizzle-orm";
import { z } from "zod";
import { db } from "#/db";
import { assessments, notifications, schedulerSettings } from "#/db/schema";
import { adminProcedure } from "./init";

export const schedulerCadences = {
	every15Minutes: "*/15 * * * *",
	hourly: "0 * * * *",
	every6Hours: "0 */6 * * *",
	daily: "0 2 * * *",
	weekly: "0 2 * * 1",
} as const;

const cadenceSchema = z.enum([
	"every15Minutes",
	"hourly",
	"every6Hours",
	"daily",
	"weekly",
]);
type SchedulerCadence = z.infer<typeof cadenceSchema>;
const cadenceEntries = Object.entries(schedulerCadences) as [
	SchedulerCadence,
	string,
][];

async function getSchedulerSettings() {
	await db
		.insert(schedulerSettings)
		.values({ id: "global" })
		.onConflictDoNothing();
	const [settings] = await db
		.select()
		.from(schedulerSettings)
		.where(eq(schedulerSettings.id, "global"))
		.limit(1);
	if (!settings)
		throw new Error("Scheduler settings could not be initialized.");
	return settings;
}

async function runScheduledTasks() {
	const now = new Date();
	const reminderWindow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
	const upcoming = await db
		.select({
			id: assessments.id,
			dueAt: assessments.dueAt,
			evaluatedUserId: assessments.evaluatedUserId,
			evaluatorUserId: assessments.evaluatorUserId,
		})
		.from(assessments)
		.where(
			and(
				ne(assessments.status, "completed"),
				ne(assessments.status, "cancelled"),
				gte(assessments.dueAt, now),
				lte(assessments.dueAt, reminderWindow),
			),
		);

	for (const assessment of upcoming) {
		const href = `/evaluation/${assessment.id}`;
		for (const userId of new Set([
			assessment.evaluatedUserId,
			assessment.evaluatorUserId,
		])) {
			const [existing] = await db
				.select({ id: notifications.id })
				.from(notifications)
				.where(
					and(
						eq(notifications.userId, userId),
						eq(notifications.title, "Assessment reminder"),
						eq(notifications.href, href),
					),
				)
				.limit(1);
			if (!existing) {
				await db.insert(notifications).values({
					id: randomUUID(),
					userId,
					title: "Assessment reminder",
					message: `An assessment step is due by ${assessment.dueAt?.toLocaleDateString() ?? "soon"}.`,
					href,
				});
			}
		}
	}
	await db
		.update(schedulerSettings)
		.set({ lastRunAt: now, updatedAt: now })
		.where(eq(schedulerSettings.id, "global"));
}

let activeJob: CronJob<null, undefined> | undefined;
let activeExpression: string | undefined;
let runInProgress = false;

async function refreshScheduler() {
	const settings = await getSchedulerSettings();
	if (settings.cronExpression === activeExpression && activeJob) return;
	activeJob?.stop();
	activeExpression = settings.cronExpression;
	activeJob = new CronJob(
		settings.cronExpression,
		async () => {
			if (runInProgress) return;
			runInProgress = true;
			try {
				await runScheduledTasks();
			} catch (error) {
				console.error("Scheduled evaluation tasks failed", error);
			} finally {
				runInProgress = false;
			}
		},
		null,
		true,
		"Europe/Warsaw",
		undefined,
		false,
		undefined,
		true,
	);
}

export const schedulerRouter = {
	getSettings: adminProcedure.query(async () => {
		const settings = await getSchedulerSettings();
		const cadence =
			cadenceEntries.find(
				([, expression]) => expression === settings.cronExpression,
			)?.[0] ?? "daily";
		return {
			cadence,
			cronExpression: settings.cronExpression,
			enabled: settings.enabled,
			lastRunAt: settings.lastRunAt,
		};
	}),
	updateSettings: adminProcedure
		.input(z.object({ cadence: cadenceSchema }))
		.mutation(async ({ input }) => {
			await getSchedulerSettings();
			const cronExpression = schedulerCadences[input.cadence];
			await db
				.update(schedulerSettings)
				.set({ cronExpression, updatedAt: new Date() })
				.where(eq(schedulerSettings.id, "global"));
			await refreshScheduler();
			return { cadence: input.cadence, cronExpression };
		}),
	runNow: adminProcedure.mutation(async () => {
		if (runInProgress)
			return {
				success: false,
				message: "A scheduled run is already in progress.",
			};
		runInProgress = true;
		try {
			await runScheduledTasks();
			return { success: true };
		} finally {
			runInProgress = false;
		}
	}),
} satisfies TRPCRouterRecord;

void refreshScheduler().catch((error) =>
	console.error("Could not start evaluation scheduler", error),
);
