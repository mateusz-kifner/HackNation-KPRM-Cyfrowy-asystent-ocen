import { useState } from "react";
import { toast } from "sonner";
import { useEvaluationRateCriteria } from "#/hooks/api/evaluations/useEvaluationRateCriteria";
import { useEvaluationCalculateResult } from "#/hooks/api/evaluations/useEvaluationCalculateResult";
import { useEvaluationSubmit } from "#/hooks/api/evaluations/useEvaluationSubmit";
import { useEvaluationUpdateForm } from "#/hooks/api/evaluations/useEvaluationUpdateForm";
import { useEvaluationUpdateSchedule } from "#/hooks/api/evaluations/useEvaluationUpdateSchedule";
import type { EvaluationDetails } from "./evaluation-types";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const points = [1, 3, 5, 7, 9] as const;

export function AssessmentEditor({
	evaluation,
	isAdmin = false,
}: {
	evaluation: EvaluationDetails;
	isAdmin?: boolean;
}) {
	const [error, setError] = useState<string | null>(null);
	const [reason, setReason] = useState("");
	const rate = useEvaluationRateCriteria({
		onError: (cause) => setError(cause.message),
		onSuccess: () => toast.success("Ratings saved"),
	});
	const updateForm = useEvaluationUpdateForm({
		onError: (cause) => setError(cause.message),
	});
	const updateSchedule = useEvaluationUpdateSchedule({
		onError: (cause) => setError(cause.message),
	});
	const submit = useEvaluationSubmit({
		onError: (cause) => setError(cause.message),
		onSuccess: () => toast.success("Assessment submitted to the employee"),
	});
	const canSubmit =
		evaluation.criteria.length > 0 &&
		evaluation.criteria.every((criterion) => criterion.points !== null) &&
		Boolean(evaluation.file?.assessmentDiscussionDate);
	const resultPreview = useEvaluationCalculateResult(
		evaluation.id,
		evaluation.criteria.length > 0 &&
			evaluation.criteria.every((criterion) => criterion.points !== null),
	);

	function saveRatings(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		setError(null);
		rate.mutate({
			assessmentId: evaluation.id,
			ratings: evaluation.criteria.map((criterion) => ({
				id: criterion.id,
				points: Number(data.get(`${criterion.id}-points`)),
				comment: String(data.get(`${criterion.id}-comment`) ?? "") || null,
			})),
			reason: reason || null,
		});
	}

	function saveDiscussion(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		const discussionDate = String(data.get("assessmentDiscussionDate") ?? "");
		const rationale = String(data.get("assessmentRationale") ?? "") || null;
		const recommendations =
			String(data.get("developmentPlanRecommendations") ?? "") || null;
		setError(null);
		updateSchedule.mutate({
			assessmentId: evaluation.id,
			assessmentDiscussionAt: discussionDate
				? new Date(`${discussionDate}T00:00:00`)
				: null,
			reason: isAdmin ? reason : "Recorded assessment discussion",
		});
		updateForm.mutate({
			assessmentId: evaluation.id,
			data: {
				assessmentRationale: rationale,
				developmentPlanRecommendations: recommendations,
			},
			reason: reason || null,
		});
	}

	return (
		<div className="space-y-5">
			<Card>
				<CardHeader>
					<CardTitle>Assessment discussion and result</CardTitle>
					<CardDescription>
						Record the discussion, rate each selected criterion, and submit the
						completed assessment.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isAdmin ? (
						<div className="mb-4 grid gap-2">
							<Label htmlFor="assessment-correction-reason">
								Admin correction reason
							</Label>
							<Textarea
								id="assessment-correction-reason"
								value={reason}
								onChange={(event) => setReason(event.target.value)}
								rows={2}
								required
							/>
						</div>
					) : null}
					<form onSubmit={saveDiscussion} className="grid gap-4 sm:grid-cols-2">
						<div className="grid gap-2">
							<Label htmlFor="assessmentDiscussionDate">Discussion date</Label>
							<input
								className="h-9 rounded-md border bg-background px-3 text-sm"
								type="date"
								id="assessmentDiscussionDate"
								name="assessmentDiscussionDate"
								defaultValue={toDateInput(
									evaluation.file?.assessmentDiscussionDate ??
										evaluation.assessmentDiscussionAt,
								)}
								required
							/>
						</div>
						<div className="sm:col-span-2 grid gap-2">
							<Label htmlFor="assessmentRationale">Assessment rationale</Label>
							<Textarea
								id="assessmentRationale"
								name="assessmentRationale"
								defaultValue={evaluation.file?.assessmentRationale ?? ""}
								rows={3}
							/>
						</div>
						<div className="sm:col-span-2 grid gap-2">
							<Label htmlFor="developmentPlanRecommendations">
								Development plan recommendations
							</Label>
							<Textarea
								id="developmentPlanRecommendations"
								name="developmentPlanRecommendations"
								defaultValue={
									evaluation.file?.developmentPlanRecommendations ?? ""
								}
								rows={3}
							/>
						</div>
						<Button
							type="submit"
							variant="outline"
							disabled={
								updateForm.isPending ||
								updateSchedule.isPending ||
								(isAdmin && !reason.trim())
							}
						>
							Save discussion details
						</Button>
					</form>
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>Criterion ratings</CardTitle>
					<CardDescription>
						Choose a rating from 1, 3, 5, 7, or 9 and add a comment when useful.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{evaluation.acknowledgements.some(
						(item) =>
							item.type === "criteria_participation" &&
							item.status === "acknowledged",
					) ? (
						<form onSubmit={saveRatings} className="space-y-4">
							{evaluation.criteria.map((criterion) => (
								<section
									key={criterion.id}
									className="grid gap-3 rounded-lg border p-4 sm:grid-cols-[minmax(0,1fr)_9rem]"
								>
									<div>
										<h3 className="font-medium">{criterion.title}</h3>
										<p className="mt-1 text-xs text-muted-foreground">
											{criterion.mandatory
												? "Required criterion"
												: "Additional criterion"}
										</p>
									</div>
									<div className="grid gap-2">
										<Label htmlFor={`${criterion.id}-points`}>Rating</Label>
										<select
											id={`${criterion.id}-points`}
											name={`${criterion.id}-points`}
											className="h-9 rounded-md border bg-background px-2 text-sm"
											defaultValue={criterion.points ?? ""}
											required
										>
											<option value="" disabled>
												Select rating
											</option>
											{points.map((point) => (
												<option key={point} value={point}>
													{point}
												</option>
											))}
										</select>
									</div>
									<div className="grid gap-2 sm:col-span-2">
										<Label htmlFor={`${criterion.id}-comment`}>Comment</Label>
										<Textarea
											id={`${criterion.id}-comment`}
											name={`${criterion.id}-comment`}
											rows={2}
											defaultValue={criterion.comment ?? ""}
										/>
									</div>
								</section>
							))}
							<Button
								type="submit"
								disabled={rate.isPending || (isAdmin && !reason.trim())}
							>
								{rate.isPending ? "Saving…" : "Save ratings"}
							</Button>
						</form>
					) : (
						<p className="text-sm text-muted-foreground">
							Ratings are available after the employee acknowledges the criteria
							discussion.
						</p>
					)}
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>Submit assessment</CardTitle>
					<CardDescription>
						Submission calculates the average and overall result from the
						recorded ratings.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<p className="text-sm text-muted-foreground">
						Calculated result:{" "}
						{resultPreview.data
							? `${resultPreview.data.overallOutcome} · ${resultPreview.data.overallLevel.replaceAll("_", " ")} · ${resultPreview.data.average.toFixed(2)} average points`
							: "Complete all ratings to calculate."}
					</p>
					<Button
						onClick={() => {
							setError(null);
							submit.mutate({
								assessmentId: evaluation.id,
								rationale: evaluation.file?.assessmentRationale ?? null,
								reason: reason || null,
							});
						}}
						disabled={
							!canSubmit || submit.isPending || (isAdmin && !reason.trim())
						}
					>
						{submit.isPending ? "Submitting…" : "Submit to employee"}
					</Button>
					{!canSubmit ? (
						<p className="text-xs text-muted-foreground">
							Save a discussion date and a rating for every criterion before
							submitting.
						</p>
					) : null}
				</CardContent>
			</Card>
			{error ? (
				<p role="alert" className="text-sm text-destructive">
					{error}
				</p>
			) : null}
		</div>
	);
}

function toDateInput(date: Date | null | undefined) {
	return date
		? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
		: "";
}
