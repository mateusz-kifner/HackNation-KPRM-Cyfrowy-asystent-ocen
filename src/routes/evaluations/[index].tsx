import { IconClipboardList } from "@tabler/icons-react";
import { Navigate, createFileRoute } from "@tanstack/react-router";
import { EvaluationDocxDownload } from "#/components/evaluation-docx-download";
import { PageBreadcrumb } from "#/components/page-breadcrumb";
import { useEvaluationAssignedToMe } from "#/hooks/api/evaluations/useEvaluationAssignedToMe";
import { authClient } from "#/lib/auth-client";
import { AppSidebar } from "@/components/app-sidebar";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/evaluations/index")({
	component: EvaluationsIndexPage,
});

function EvaluationsIndexPage() {
	const evaluationsQuery = useEvaluatorAssessments();
	const { data: session, isPending: isSessionPending } =
		authClient.useSession();
	const role = (session?.user as { role?: string } | undefined)?.role;
	const hasManagerAccess = role === "Manager" || role === "Admin";

	if (
		!evaluationsQuery.isLoading &&
		!isSessionPending &&
		!hasManagerAccess &&
		(evaluationsQuery.isError || evaluationsQuery.data?.length === 0)
	) {
		return <Navigate to="/" />;
	}

	return (
		<SidebarProvider>
			<div className="flex min-h-screen w-full">
				<AppSidebar />
				<main className="min-w-0 flex-1 space-y-6 p-4 sm:p-6">
					<header>
						<PageBreadcrumb
							items={[
								{ label: hasManagerAccess ? "Evaluations" : "My evaluations" },
							]}
						/>
						<p className="mt-1 text-sm text-muted-foreground">
							{hasManagerAccess
								? "All assessments in the system."
								: "Assessments where you are the assigned evaluator."}
						</p>
					</header>

					<Card>
						<CardHeader>
							<CardTitle>
								{hasManagerAccess ? "All assessments" : "Assigned assessments"}
							</CardTitle>
							<CardDescription>
								{evaluationsQuery.data
									? `${evaluationsQuery.data.length} ${evaluationsQuery.data.length === 1 ? "assessment" : "assessments"}`
									: "Your evaluator assignments"}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<EvaluationsTable
								evaluations={evaluationsQuery.data ?? []}
								isLoading={evaluationsQuery.isLoading}
								hasError={evaluationsQuery.isError}
							/>
						</CardContent>
					</Card>
				</main>
			</div>
		</SidebarProvider>
	);
}

type EvaluatorAssessment = NonNullable<
	ReturnType<typeof useEvaluatorAssessments>["data"]
>[number];

function useEvaluatorAssessments() {
	return useEvaluationAssignedToMe();
}

function EvaluationsTable({
	evaluations,
	isLoading,
	hasError,
}: {
	evaluations: EvaluatorAssessment[];
	isLoading: boolean;
	hasError: boolean;
}) {
	if (isLoading) return <EvaluationsTableLoading />;

	if (hasError) {
		return (
			<p role="alert" className="py-8 text-center text-sm text-destructive">
				Could not load your assigned evaluations. Try refreshing the page.
			</p>
		);
	}

	if (evaluations.length === 0) {
		return (
			<Empty className="min-h-56 border">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<IconClipboardList />
					</EmptyMedia>
					<EmptyTitle>No evaluations assigned</EmptyTitle>
					<EmptyDescription>
						Assessments assigned to you as evaluator will appear here.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Evaluated employee</TableHead>
					<TableHead>Position</TableHead>
					<TableHead>Form</TableHead>
					<TableHead>Status</TableHead>
					<TableHead>Assessment period</TableHead>
					<TableHead>Assessment date</TableHead>
					<TableHead>Due date</TableHead>
					<TableHead>Document</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{evaluations.map((evaluation) => (
					<TableRow key={evaluation.id}>
						<TableCell className="font-medium">
							<div>{getEvaluatedName(evaluation)}</div>
							{evaluation.evaluatedOrganizationalUnit && (
								<div className="text-xs text-muted-foreground">
									{evaluation.evaluatedOrganizationalUnit}
								</div>
							)}
						</TableCell>
						<TableCell>{evaluation.evaluatedPosition ?? "—"}</TableCell>
						<TableCell>
							{evaluation.form ? `Form ${evaluation.form}` : "—"}
						</TableCell>
						<TableCell>
							<AssessmentStatus status={evaluation.status} />
						</TableCell>
						<TableCell>
							{formatPeriod(evaluation.periodStart, evaluation.periodEnd)}
						</TableCell>
						<TableCell>{formatDate(evaluation.assessmentDate)}</TableCell>
						<TableCell>
							<DueDate date={evaluation.dueAt} status={evaluation.status} />
						</TableCell>
						<TableCell>
							<EvaluationDocxDownload assessmentId={evaluation.id} />
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}

function EvaluationsTableLoading() {
	return (
		<div
			className="space-y-3 py-2"
			role="status"
			aria-label="Loading assigned evaluations"
		>
			{["loading-1", "loading-2", "loading-3", "loading-4", "loading-5"].map(
				(key) => (
					<Skeleton key={key} className="h-10 w-full" />
				),
			)}
		</div>
	);
}

function AssessmentStatus({ status }: { status: string | null }) {
	const label = status
		? status
				.replaceAll("_", " ")
				.replace(/\b\w/g, (letter) => letter.toUpperCase())
		: "Unknown";
	const variant =
		status === "completed"
			? "secondary"
			: status === "cancelled"
				? "destructive"
				: "outline";

	return <Badge variant={variant}>{label}</Badge>;
}

function DueDate({
	date,
	status,
}: {
	date: Date | null;
	status: string | null;
}) {
	if (!date) return "—";
	const overdue =
		date.getTime() < Date.now() &&
		status !== "completed" &&
		status !== "cancelled";

	return (
		<span className={overdue ? "font-medium text-destructive" : undefined}>
			{formatDate(date)}
			{overdue && <span className="ml-2 text-xs">Overdue</span>}
		</span>
	);
}

function getEvaluatedName(evaluation: EvaluatorAssessment) {
	const name = [evaluation.evaluatedFirstName, evaluation.evaluatedLastName]
		.filter(Boolean)
		.join(" ");
	return name || "Unnamed employee";
}

function formatPeriod(start: Date | null, end: Date | null) {
	if (!start && !end) return "—";
	return `${formatDate(start)} – ${formatDate(end)}`;
}

function formatDate(date: Date | null) {
	return date
		? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date)
		: "—";
}
