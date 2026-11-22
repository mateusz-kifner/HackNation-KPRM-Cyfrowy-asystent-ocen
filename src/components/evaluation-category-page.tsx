import { IconClipboardList, IconSearch } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import { authClient } from "#/lib/auth-client";
import { EvaluationDocxDownload } from "#/components/evaluation-docx-download";
import { EvaluationPreviewLink } from "#/components/evaluation-preview-link";
import { useEvaluationList } from "#/hooks/api/evaluations/useEvaluationList";
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
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const categories = [
	{ label: "All", key: "all" },
	{ label: "Current", key: "running" },
	{ label: "Upcoming", key: "upcoming" },
	{ label: "Archived", key: "completed" },
] as const;

type Category = (typeof categories)[number]["key"];
type Evaluation = NonNullable<
	ReturnType<typeof useEvaluationList>["data"]
>[number];

export function EvaluationCategoryPage({
	category = "all",
}: {
	category?: Category;
}) {
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("all");
	const [overdueOnly, setOverdueOnly] = useState(false);
	const { data: session } = authClient.useSession();
	const role = (session?.user as { role?: string } | undefined)?.role;
	const canAddEvaluation = role === "Admin" || role === "Manager";
	const evaluationsQuery = useEvaluationList({
		query: search.trim() || undefined,
		status:
			status === "all"
				? undefined
				: (status as
						| "draft"
						| "criteria_setting"
						| "ready_for_assessment"
						| "assessment_in_progress"
						| "awaiting_employee_acknowledgement"
						| "completed"
						| "cancelled"),
		overdueOnly: overdueOnly || undefined,
	});
	const evaluations = (evaluationsQuery.data ?? []).filter((evaluation) =>
		belongsToCategory(evaluation, category),
	);

	return (
		<main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
			<header>
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div>
						<PageBreadcrumb items={[{ label: "Evaluations" }]} />
					</div>
					{canAddEvaluation && (
						<Button asChild>
							<Link to="/evaluation/add">
								<IconPlus aria-hidden="true" />
								New evaluation
							</Link>
						</Button>
					)}
				</div>
			</header>
			<Card>
				<CardHeader>
					<CardTitle>Evaluations</CardTitle>
					<CardDescription>
						{evaluationsQuery.isLoading
							? "Loading assessments…"
							: `${evaluations.length} ${evaluations.length === 1 ? "assessment" : "assessments"}`}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{canAddEvaluation ? (
						<div className="mb-5 grid gap-3 sm:grid-cols-[minmax(14rem,1fr)_14rem_auto]">
							<div className="relative">
								<IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									className="pl-9"
									value={search}
									onChange={(event) => setSearch(event.target.value)}
									placeholder="Search ID, form, or status"
									aria-label="Search assessments"
								/>
							</div>
							<Select value={status} onValueChange={setStatus}>
								<SelectTrigger aria-label="Filter assessments by status">
									<SelectValue placeholder="Any status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Any status</SelectItem>
									<SelectItem value="draft">Draft</SelectItem>
									<SelectItem value="criteria_setting">
										Criteria setting
									</SelectItem>
									<SelectItem value="ready_for_assessment">
										Ready for assessment
									</SelectItem>
									<SelectItem value="assessment_in_progress">
										Assessment in progress
									</SelectItem>
									<SelectItem value="awaiting_employee_acknowledgement">
										Awaiting acknowledgement
									</SelectItem>
									<SelectItem value="completed">Completed</SelectItem>
									<SelectItem value="cancelled">Cancelled</SelectItem>
								</SelectContent>
							</Select>
							<label className="flex items-center gap-2 rounded-md border px-3 text-sm">
								<input
									type="checkbox"
									checked={overdueOnly}
									onChange={(event) => setOverdueOnly(event.target.checked)}
								/>
								Overdue only
							</label>
						</div>
					) : null}
					<EvaluationTable
						evaluations={evaluations}
						category={category}
						isLoading={evaluationsQuery.isLoading}
						hasError={evaluationsQuery.isError}
					/>
				</CardContent>
			</Card>
		</main>
	);
}

export { categories };
export type { Category };

function belongsToCategory(evaluation: Evaluation, category: Category) {
	if (category === "all") return true;
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
								<EvaluationPreviewLink evaluationId={evaluation.id}>
									{[evaluation.evaluatedFirstName, evaluation.evaluatedLastName]
										.filter(Boolean)
										.join(" ") || "Unnamed employee"}
								</EvaluationPreviewLink>
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
