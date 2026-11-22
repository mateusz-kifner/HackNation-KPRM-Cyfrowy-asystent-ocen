import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useEvaluationRecordReviewOutcome } from "#/hooks/api/evaluations/useEvaluationRecordReviewOutcome";
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

export function ReviewOutcomePanel({
	evaluation,
}: {
	evaluation: EvaluationDetails;
}) {
	const [reason, setReason] = useState("");
	const [outcome, setOutcome] = useState<"change" | "repeat">("change");
	const navigate = useNavigate();
	const record = useEvaluationRecordReviewOutcome({
		onSuccess: async (result) => {
			if (result.replacementAssessmentId)
				await navigate({
					to: "/evaluation/$id",
					params: { id: result.replacementAssessmentId },
				});
		},
	});
	return (
		<Card>
			<CardHeader>
				<CardTitle>Record review outcome</CardTitle>
				<CardDescription>
					Record an authorized review decision. A repeat creates a replacement
					assessment and retains this record.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid gap-2">
					<Label htmlFor="review-outcome">Decision</Label>
					<select
						id="review-outcome"
						className="h-9 rounded-md border bg-background px-3 text-sm"
						value={outcome}
						onChange={(event) =>
							setOutcome(event.target.value as "change" | "repeat")
						}
					>
						<option value="change">Change assessment</option>
						<option value="repeat">Repeat assessment</option>
					</select>
				</div>
				<div className="grid gap-2">
					<Label htmlFor="review-reason">Decision and required changes</Label>
					<Textarea
						id="review-reason"
						value={reason}
						onChange={(event) => setReason(event.target.value)}
						rows={4}
						required
					/>
				</div>
				{record.error ? (
					<p role="alert" className="text-sm text-destructive">
						{record.error.message}
					</p>
				) : null}
				<Button
					disabled={!reason.trim() || record.isPending}
					onClick={() =>
						record.mutate({
							assessmentId: evaluation.id,
							outcome,
							reason: reason.trim(),
						})
					}
				>
					{record.isPending ? "Recording…" : "Record review decision"}
				</Button>
			</CardContent>
		</Card>
	);
}
