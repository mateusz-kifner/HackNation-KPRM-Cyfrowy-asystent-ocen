import { IconClipboardList, IconEye } from "@tabler/icons-react";
import { useState } from "react";
import { EvaluationDocumentPreview } from "#/components/evaluation-document-preview";
import { EvaluationDocxDownload } from "#/components/evaluation-docx-download";
import { useEvaluationAssignedToMe } from "#/hooks/api/evaluations/useEvaluationAssignedToMe";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "#/components/ui/empty";
import { Skeleton } from "#/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/ui/table";
import { PageBreadcrumb } from "#/components/page-breadcrumb";

type Assessment = NonNullable<
	ReturnType<typeof useEvaluationAssignedToMe>["data"]
>[number];

export function EvaluationDocumentsPage() {
	const assessmentsQuery = useEvaluationAssignedToMe();
	const [selectedAssessment, setSelectedAssessment] =
		useState<Assessment | null>(null);
	const assessments = assessmentsQuery.data ?? [];

	return (
		<main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
			<header>
				<PageBreadcrumb items={[{ label: "Evaluation documents" }]} />
			</header>
			<Card>
				<CardHeader>
					<CardTitle>Evaluation documents</CardTitle>
					<CardDescription>
						{assessmentsQuery.isLoading
							? "Loading assigned assessments…"
							: `${assessments.length} ${assessments.length === 1 ? "assessment" : "assessments"} assigned to you`}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{assessmentsQuery.isLoading ? <AssessmentListSkeleton /> : null}
					{assessmentsQuery.isError ? (
						<p
							role="alert"
							className="py-8 text-center text-sm text-destructive"
						>
							Could not load assigned assessments. Try refreshing the page.
						</p>
					) : null}
					{!assessmentsQuery.isLoading &&
					!assessmentsQuery.isError &&
					assessments.length === 0 ? (
						<Empty className="min-h-56 border">
							<EmptyHeader>
								<EmptyMedia variant="icon">
									<IconClipboardList />
								</EmptyMedia>
								<EmptyTitle>No assigned assessments</EmptyTitle>
								<EmptyDescription>
									Assessment documents assigned to you will appear here.
								</EmptyDescription>
							</EmptyHeader>
						</Empty>
					) : null}
					{assessments.length > 0 ? (
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Employee</TableHead>
										<TableHead>Position</TableHead>
										<TableHead>Form</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Assessment period</TableHead>
										<TableHead>Due date</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{assessments.map((assessment) => (
										<TableRow key={assessment.id}>
											<TableCell className="font-medium">
												{[
													assessment.evaluatedFirstName,
													assessment.evaluatedLastName,
												]
													.filter(Boolean)
													.join(" ") || "Employee"}
											</TableCell>
											<TableCell>
												{assessment.evaluatedPosition || "—"}
											</TableCell>
											<TableCell>
												{assessment.form ? `Form ${assessment.form}` : "—"}
											</TableCell>
											<TableCell>
												<Badge variant="secondary">
													{formatStatus(assessment.status)}
												</Badge>
											</TableCell>
											<TableCell>
												{formatPeriod(
													assessment.periodStart,
													assessment.periodEnd,
												)}
											</TableCell>
											<TableCell>{formatDate(assessment.dueAt)}</TableCell>
											<TableCell>
												<div className="flex justify-end gap-2">
													<Button
														variant="outline"
														size="sm"
														onClick={() => setSelectedAssessment(assessment)}
													>
														<IconEye aria-hidden="true" />
														Preview
													</Button>
													<EvaluationDocxDownload
														assessmentId={assessment.id}
													/>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					) : null}
				</CardContent>
			</Card>
			<Dialog
				open={Boolean(selectedAssessment)}
				onOpenChange={(open) => {
					if (!open) setSelectedAssessment(null);
				}}
			>
				<DialogContent className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden">
					<DialogHeader>
						<DialogTitle>Assessment document preview</DialogTitle>
						<DialogDescription>
							Preview uses the saved assessment details and ratings.
						</DialogDescription>
					</DialogHeader>
					{selectedAssessment ? (
						<EvaluationDocumentPreview assessmentId={selectedAssessment.id} />
					) : null}
				</DialogContent>
			</Dialog>
		</main>
	);
}

function AssessmentListSkeleton() {
	return (
		<div
			className="space-y-3 py-2"
			role="status"
			aria-label="Loading assessments"
		>
			{[1, 2, 3, 4].map((row) => (
				<Skeleton key={row} className="h-10 w-full" />
			))}
		</div>
	);
}

function formatDate(value: Date | null | undefined) {
	return value
		? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(value)
		: "—";
}

function formatPeriod(
	start: Date | null | undefined,
	end: Date | null | undefined,
) {
	return start || end ? `${formatDate(start)} – ${formatDate(end)}` : "—";
}

function formatStatus(status: string) {
	return status
		.split("_")
		.map((word) => word[0]?.toUpperCase() + word.slice(1))
		.join(" ");
}
