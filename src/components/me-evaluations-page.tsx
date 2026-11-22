import { IconClipboardList } from "@tabler/icons-react";
import { EvaluationDocxDownload } from "#/components/evaluation-docx-download";
import { EvaluationPreviewLink } from "#/components/evaluation-preview-link";
import { useEvaluationsForMe } from "#/hooks/api/evaluations/useEvaluationsForMe";
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

type Evaluation = NonNullable<
	ReturnType<typeof useEvaluationsForMe>["data"]
>[number];

export function MeEvaluationsPage() {
	const evaluationsQuery = useEvaluationsForMe();
	const evaluations = evaluationsQuery.data ?? [];

	return (
		<main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
			<header>
				<h1 className="text-2xl font-semibold tracking-tight">
					My evaluations
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Assessments of your work, including current and completed evaluations.
				</p>
			</header>
			<Card>
				<CardHeader>
					<CardTitle>Evaluations of my work</CardTitle>
					<CardDescription>
						{evaluationsQuery.isLoading
							? "Loading assessments…"
							: `${evaluations.length} ${evaluations.length === 1 ? "assessment" : "assessments"}`}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<EvaluationsTable
						evaluations={evaluations}
						isLoading={evaluationsQuery.isLoading}
						hasError={evaluationsQuery.isError}
					/>
				</CardContent>
			</Card>
		</main>
	);
}

function EvaluationsTable({
	evaluations,
	isLoading,
	hasError,
}: {
	evaluations: Evaluation[];
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
				Could not load your evaluations. Try refreshing the page.
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
					<EmptyTitle>No evaluations yet</EmptyTitle>
					<EmptyDescription>
						Evaluations of your work will appear here.
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
									{evaluation.form ? `Form ${evaluation.form}` : "Evaluation"}
								</EvaluationPreviewLink>
							</TableCell>
							<TableCell>
								<Badge
									variant={
										evaluation.status === "completed" ? "secondary" : "outline"
									}
								>
									{evaluation.status?.replaceAll("_", " ") ?? "Unknown"}
								</Badge>
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

function formatPeriod(start: Date | null, end: Date | null) {
	if (!start && !end) return "—";
	return `${formatDate(start)} – ${formatDate(end)}`;
}

function formatDate(date: Date | null) {
	return date
		? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date)
		: "—";
}
