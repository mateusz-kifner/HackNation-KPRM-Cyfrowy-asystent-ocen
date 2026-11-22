import { IconArrowLeft } from "@tabler/icons-react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useEvaluationGet } from "#/hooks/api/evaluations/useEvaluationGet";
import { EvaluationDocxDownload } from "#/components/evaluation-docx-download";
import { PageBreadcrumb } from "#/components/page-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/evaluation/$id")({
	component: EvaluationDetailsPage,
});

function EvaluationDetailsPage() {
	const { id } = Route.useParams();
	const query = useEvaluationGet(id);
	const evaluation = query.data;

	return (
		<main className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6">
			<header className="space-y-3">
				<PageBreadcrumb items={[{ label: "Evaluations", href: "/evaluation/running" }, { label: "Evaluation details" }]} />
				<Button variant="ghost" size="sm" asChild>
					<Link to="/evaluation/running"><IconArrowLeft /> Back to evaluations</Link>
				</Button>
			</header>
			{query.isLoading ? <EvaluationDetailsLoading /> : null}
			{query.isError ? <p role="alert" className="text-sm text-destructive">Could not load this evaluation. You may not have access to it.</p> : null}
			{evaluation ? (
				<>
					<Card>
						<CardHeader className="flex flex-row items-start justify-between gap-4">
							<div className="space-y-2">
								<CardTitle>{[evaluation.file?.evaluatedFirstName, evaluation.file?.evaluatedLastName].filter(Boolean).join(" ") || "Evaluation"}</CardTitle>
								<Badge variant={evaluation.status === "completed" ? "secondary" : "outline"}>{evaluation.status.replaceAll("_", " ")}</Badge>
							</div>
							<EvaluationDocxDownload assessmentId={evaluation.id} />
						</CardHeader>
						<CardContent className="grid gap-4 sm:grid-cols-2">
							<Detail label="Position" value={evaluation.file?.evaluatedPosition} />
							<Detail label="Organizational unit" value={evaluation.file?.evaluatedOrganizationalUnit} />
							<Detail label="Evaluator" value={[evaluation.file?.evaluatorFirstName, evaluation.file?.evaluatorLastName].filter(Boolean).join(" ")} />
							<Detail label="Form" value={evaluation.form ? `Form ${evaluation.form}` : null} />
							<Detail label="Assessment period" value={`${formatDate(evaluation.periodStart)} – ${formatDate(evaluation.periodEnd)}`} />
							<Detail label="Assessment date" value={formatDate(evaluation.assessmentDate)} />
							<Detail label="Due date" value={formatDate(evaluation.dueAt)} />
							<Detail label="Overall result" value={evaluation.file?.overallOutcome} />
							<Detail label="Overall level" value={evaluation.file?.overallLevel} />
							<Detail label="Average points" value={evaluation.file?.averagePoints?.toString()} />
							<Detail label="Assessment rationale" value={evaluation.file?.assessmentRationale} />
							<Detail label="Development plan" value={evaluation.file?.developmentPlanRecommendations} />
						</CardContent>
					</Card>
					<Card>
						<CardHeader><CardTitle>Evaluation criteria</CardTitle></CardHeader>
						<CardContent className="space-y-4">
							{evaluation.criteria.length ? evaluation.criteria.map((criterion) => (
								<section key={criterion.id} className="space-y-2 border-b pb-4 last:border-0">
									<div className="flex flex-wrap items-baseline justify-between gap-2"><h2 className="font-medium">{criterion.title}</h2><span className="text-sm text-muted-foreground">{criterion.points ?? "Not rated"} points</span></div>
									<Detail label="Description" value={criterion.description} />
									<Detail label="Duties" value={criterion.duties} />
									<Detail label="Expectations" value={criterion.expectations} />
									<Detail label="Goals" value={criterion.goals} />
									<Detail label="Measurement method" value={criterion.measurementMethod} />
									<Detail label="Comment" value={criterion.comment} />
								</section>
							)) : <p className="text-sm text-muted-foreground">No criteria have been recorded yet.</p>}
						</CardContent>
					</Card>
				</>
			) : null}
		</main>
	);
}

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
	if (!value) return null;
	return <div className="space-y-1"><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="whitespace-pre-wrap text-sm">{value}</p></div>;
}

function EvaluationDetailsLoading() {
	return <div className="space-y-4"><Skeleton className="h-40 w-full" /><Skeleton className="h-64 w-full" /></div>;
}

function formatDate(date: Date | null) {
	return date ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date) : "—";
}
