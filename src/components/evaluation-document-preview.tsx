import { useEvaluationGet } from "#/hooks/api/evaluations/useEvaluationGet";
import { Skeleton } from "#/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/ui/table";

export function EvaluationDocumentPreview({
	assessmentId,
}: {
	assessmentId: string;
}) {
	const assessmentQuery = useEvaluationGet(assessmentId);
	if (assessmentQuery.isLoading)
		return (
			<div className="space-y-3 overflow-y-auto py-2">
				{[1, 2, 3, 4, 5].map((row) => (
					<Skeleton key={row} className="h-12 w-full" />
				))}
			</div>
		);
	if (assessmentQuery.isError || !assessmentQuery.data)
		return (
			<p role="alert" className="py-8 text-center text-sm text-destructive">
				Could not load this assessment document.
			</p>
		);

	const { data } = assessmentQuery;
	const file = data.file;
	return (
		<div className="min-h-0 space-y-6 overflow-y-auto pr-2">
			<PreviewSection title="Employee and evaluator">
				<PreviewFields
					fields={[
						["Agency", file?.agencyName],
						[
							"Employee",
							[file?.evaluatedFirstName, file?.evaluatedLastName]
								.filter(Boolean)
								.join(" "),
						],
						["Employee type", file?.evaluatedPersonType],
						["Position", file?.evaluatedPosition],
						["Organizational unit", file?.evaluatedOrganizationalUnit],
						[
							"Evaluator",
							[file?.evaluatorFirstName, file?.evaluatorLastName]
								.filter(Boolean)
								.join(" ") || data.assignedEvaluator?.name,
						],
						["Evaluator position", file?.evaluatorPosition],
						[
							"Evaluator organizational unit",
							file?.evaluatorOrganizationalUnit,
						],
						["Form", data.form ? `Form ${data.form}` : null],
						["Status", data.status],
					]}
				/>
			</PreviewSection>
			<PreviewSection title="Assessment periods and meetings">
				<PreviewFields
					fields={[
						[
							"Assessment period",
							`${date(file?.assessmentPeriodStart ?? data.periodStart)} – ${date(file?.assessmentPeriodEnd ?? data.periodEnd)}`,
						],
						["Assessment due", date(data.dueAt)],
						["Assessment date", date(data.assessmentDate)],
						[
							"Criteria discussion",
							date(file?.criteriaDiscussionDate ?? data.criteriaDiscussionAt),
						],
						["Criteria discussion location", file?.criteriaDiscussionLocation],
						[
							"Assessment discussion",
							date(
								file?.assessmentDiscussionDate ?? data.assessmentDiscussionAt,
							),
						],
					]}
				/>
			</PreviewSection>
			<PreviewSection title="Criteria and ratings">
				<div className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Criterion</TableHead>
								<TableHead>Description and expectations</TableHead>
								<TableHead>Rating</TableHead>
								<TableHead>Notes</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{[...data.criteria]
								.sort((a, b) => a.sortOrder - b.sortOrder)
								.map((criterion) => (
									<TableRow key={criterion.id}>
										<TableCell className="font-medium">
											{criterion.title}
										</TableCell>
										<TableCell className="whitespace-pre-wrap">
											{[
												criterion.description,
												criterion.duties,
												criterion.expectations,
												criterion.goals,
												criterion.measurementMethod,
											]
												.filter(Boolean)
												.join("\n") || "—"}
										</TableCell>
										<TableCell>
											{criterion.points == null
												? "—"
												: `${criterion.points} / 9`}
										</TableCell>
										<TableCell className="whitespace-pre-wrap">
											{criterion.comment || "—"}
										</TableCell>
									</TableRow>
								))}
							{data.criteria.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={4}
										className="text-center text-muted-foreground"
									>
										No criteria have been saved.
									</TableCell>
								</TableRow>
							) : null}
						</TableBody>
					</Table>
				</div>
				<PreviewFields
					className="mt-4"
					fields={[
						[
							"Average rating",
							file?.averagePoints == null
								? null
								: Number(file.averagePoints.toFixed(2)),
						],
						["Overall level", file?.overallLevel],
						["Outcome", file?.overallOutcome],
					]}
				/>
			</PreviewSection>
			<PreviewSection title="Notes and development">
				<PreviewFields
					fields={[
						["Assessment rationale", file?.assessmentRationale],
						[
							"Development plan recommendations",
							file?.developmentPlanRecommendations,
						],
					]}
				/>
			</PreviewSection>
			<PreviewSection title="Additional information">
				<PreviewFields
					fields={[
						["Previous outcome", file?.previousAssessmentOutcome],
						["Previous level", file?.previousAssessmentLevel],
						["Previous assessment date", date(file?.previousAssessmentDate)],
						["Promotion application", file?.promotionApplication],
						[
							"Civil service appointment year",
							file?.civilServiceAppointmentYear,
						],
						["Current grade", file?.currentCivilServiceGrade],
						["Current grade granted", date(file?.currentGradeGrantedAt)],
						["Requested grade", file?.requestedCivilServiceGrade],
						["Application rationale", file?.promotionApplicationRationale],
						["Application location", file?.promotionApplicationLocation],
						["Application date", date(file?.promotionApplicationDate)],
						["Application evaluator", file?.promotionApplicationEvaluatorName],
					]}
				/>
			</PreviewSection>
			<PreviewSection title="Signatures and confirmations">
				<PreviewFields
					fields={[
						["Evaluator signature location", file?.evaluatorSignatureLocation],
						["Evaluator signed at", date(file?.evaluatorSignedAt)],
						["Employee receipt location", file?.employeeReceiptLocation],
						["Employee acknowledged at", date(file?.employeeAcknowledgedAt)],
						["Employee receipt name", file?.employeeReceiptName],
						["Objection recipient", file?.objectionRecipient],
						[
							"Criteria discussion evaluator",
							file?.criteriaDiscussionEvaluatorName,
						],
						[
							"Criteria discussion employee",
							file?.criteriaDiscussionEmployeeName,
						],
					]}
				/>
				<div className="grid gap-8 pt-6 sm:grid-cols-2">
					<SignatureLine label="Evaluator signature" />
					<SignatureLine label="Employee signature" />
				</div>
			</PreviewSection>
		</div>
	);
}

function PreviewSection({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<section className="space-y-3">
			<h3 className="border-b pb-2 text-base font-semibold">{title}</h3>
			{children}
		</section>
	);
}

function PreviewFields({
	fields,
	className,
}: {
	fields: [string, string | number | null | undefined][];
	className?: string;
}) {
	const visibleFields = fields.filter(
		([, value]) => value !== null && value !== undefined && value !== "",
	);
	if (!visibleFields.length)
		return (
			<p className="text-sm text-muted-foreground">No saved information.</p>
		);
	return (
		<dl className={`grid gap-x-6 gap-y-3 sm:grid-cols-2 ${className ?? ""}`}>
			{visibleFields.map(([label, value]) => (
				<div key={label} className="min-w-0">
					<dt className="text-xs font-medium text-muted-foreground">{label}</dt>
					<dd className="whitespace-pre-wrap break-words text-sm">
						{String(value)}
					</dd>
				</div>
			))}
		</dl>
	);
}

function SignatureLine({ label }: { label: string }) {
	return (
		<div className="pt-8 text-center">
			<div className="border-t border-muted-foreground/50" />
			<p className="pt-2 text-xs text-muted-foreground">{label}</p>
		</div>
	);
}

function date(value: Date | null | undefined) {
	return value
		? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(value)
		: "—";
}
