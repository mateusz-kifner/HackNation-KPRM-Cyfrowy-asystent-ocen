import { IconClipboardList } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { IconPlus } from "@tabler/icons-react";
import { authClient } from "#/lib/auth-client";
import { EvaluationDocxDownload } from "#/components/evaluation-docx-download";
import { useTRPC } from "#/integrations/trpc/react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { EvaluationNavigation } from "@/components/evaluation-navigation";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

const categories = [
	{ label: "Running", to: "/evaluation/running", key: "running" },
	{ label: "Upcoming", to: "/evaluation/upcoming", key: "upcoming" },
	{ label: "Completed", to: "/evaluation/completed", key: "completed" },
] as const;

type Category = (typeof categories)[number]["key"];
type Evaluation = NonNullable<
	ReturnType<typeof useEvaluations>["data"]
>[number];

export function EvaluationCategoryPage({ category }: { category: Category }) {
	const evaluationsQuery = useEvaluations();
	const { data: session } = authClient.useSession();
	const role = (session?.user as { role?: string } | undefined)?.role;
	const canAddEvaluation = role === "Admin" || role === "Manager";
	const evaluations = (evaluationsQuery.data ?? []).filter((evaluation) =>
		belongsToCategory(evaluation, category),
	);
	const title = categories.find((item) => item.key === category)?.label;

	return (
		<main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
			<header>
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div>
						<PageBreadcrumb items={[{ label: "Evaluations", href: "/evaluation/running" }, { label: title ?? "Evaluations" }]} />
						<p className="mt-1 text-sm text-muted-foreground">
							Track your assigned assessments by their current stage.
						</p>
					</div>
					{canAddEvaluation && (
						<Button asChild>
							<Link to="/evaluation/add">
								<IconPlus aria-hidden="true" />
								Add evaluation
							</Link>
						</Button>
					)}
				</div>
			</header>
			<div className="flex flex-col gap-6 md:flex-row md:items-start">
				<EvaluationNavigation category={category} />
				<Card className="min-w-0 flex-1">
					<CardHeader>
						<CardTitle>{title} evaluations</CardTitle>
						<CardDescription>
							{evaluationsQuery.isLoading
								? "Loading assessments…"
								: `${evaluations.length} ${evaluations.length === 1 ? "assessment" : "assessments"}`}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<EvaluationTable
							evaluations={evaluations}
							category={category}
							isLoading={evaluationsQuery.isLoading}
							hasError={evaluationsQuery.isError}
						/>
					</CardContent>
				</Card>
			</div>
		</main>
	);
}

export { categories };
export type { Category };

function useEvaluations() {
	const trpc = useTRPC();
	return useQuery(trpc.evaluations.assignedToMe.queryOptions());
}

function belongsToCategory(evaluation: Evaluation, category: Category) {
	if (category === "completed") return evaluation.status === "completed";
	if (evaluation.status === "completed" || evaluation.status === "cancelled") {
		return false;
	}
	if (category === "upcoming") {
		return (
			evaluation.status === "draft" ||
			(evaluation.assessmentDate !== null &&
				evaluation.assessmentDate.getTime() > Date.now())
		);
	}
	return (
		evaluation.status !== "draft" &&
		(evaluation.assessmentDate === null ||
			evaluation.assessmentDate.getTime() <= Date.now())
	);
}

function EvaluationTable({
	evaluations,
	category,
	isLoading,
	hasError,
}: {
	evaluations: Evaluation[];
	category: Category;
	isLoading: boolean;
	hasError: boolean;
}) {
	if (isLoading) {
		return (
			<div
				className="space-y-3 py-2"
				role="status"
				aria-label="Loading evaluations"
			>
				{[1, 2, 3, 4].map((row) => (
					<Skeleton key={row} className="h-10 w-full" />
				))}
			</div>
		);
	}
	if (hasError) {
		return (
			<p role="alert" className="py-8 text-center text-sm text-destructive">
				Could not load evaluations. Try refreshing the page.
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
					<EmptyTitle>No {category} evaluations</EmptyTitle>
					<EmptyDescription>
						Evaluations in this stage will appear here.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}
	return (
		<div className="overflow-x-auto">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Evaluated employee</TableHead>
						<TableHead>Position</TableHead>
						<TableHead>Form</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Period</TableHead>
						<TableHead>Assessment date</TableHead>
						<TableHead>Due date</TableHead>
						<TableHead>Document</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{evaluations.map((evaluation) => (
						<TableRow key={evaluation.id}>
							<TableCell className="font-medium">
								{[evaluation.evaluatedFirstName, evaluation.evaluatedLastName]
									.filter(Boolean)
									.join(" ") || "Unnamed employee"}
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
							<TableCell>{formatDate(evaluation.dueAt)}</TableCell>
							<TableCell>
								<EvaluationDocxDownload assessmentId={evaluation.id} />
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}

function AssessmentStatus({ status }: { status: string | null }) {
	const label =
		status
			?.replaceAll("_", " ")
			.replace(/\b\w/g, (letter) => letter.toUpperCase()) ?? "Unknown";
	return (
		<Badge variant={status === "completed" ? "secondary" : "outline"}>
			{label}
		</Badge>
	);
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
