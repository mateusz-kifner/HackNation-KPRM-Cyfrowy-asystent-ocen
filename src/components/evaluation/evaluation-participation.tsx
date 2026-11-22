import { useState } from "react";
import { useFormTool } from "#/components/form-tool-context";
import { authClient } from "#/lib/auth-client";
import { useEvaluationAcknowledge } from "#/hooks/api/evaluations/useEvaluationAcknowledge";
import { useEvaluationDecideDateChange } from "#/hooks/api/evaluations/useEvaluationDecideDateChange";
import { useEvaluationRequestDateChange } from "#/hooks/api/evaluations/useEvaluationRequestDateChange";
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

export function EvaluationParticipation({
	evaluation,
}: {
	evaluation: EvaluationDetails;
}) {
	const dateRequestFormRef = useFormTool("Assessment date change request");
	const session = authClient.useSession();
	const actor = session.data?.user as { id: string; role?: string } | undefined;
	const isEvaluatedPerson = actor?.id === evaluation.evaluatedUserId;
	const canDecide =
		actor?.id === evaluation.evaluatorUserId || actor?.role === "Admin";
	const criteriaAck = evaluation.acknowledgements.find(
		(item) => item.type === "criteria_participation",
	);
	const resultAck = evaluation.acknowledgements.find(
		(item) => item.type === "result_receipt",
	);
	const pendingRequests = evaluation.dateChangeRequests.filter(
		(request) => request.status === "pending",
	);
	const acknowledge = useEvaluationAcknowledge();
	const requestChange = useEvaluationRequestDateChange();
	const decideChange = useEvaluationDecideDateChange();
	const error =
		acknowledge.error?.message ??
		requestChange.error?.message ??
		decideChange.error?.message;

	function submitDateRequest(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		const proposedDate = String(data.get("proposedDate") ?? "");
		const reason = String(data.get("reason") ?? "").trim();
		requestChange.mutate({
			assessmentId: evaluation.id,
			proposedDate: new Date(`${proposedDate}T00:00:00`),
			reason,
		});
	}

	return (
		<div className="space-y-5">
			{isEvaluatedPerson &&
			!criteriaAck &&
			evaluation.status === "criteria_setting" ? (
				<Card>
					<CardHeader>
						<CardTitle>Confirm criteria participation</CardTitle>
						<CardDescription>
							Confirm that you participated in the criteria-setting discussion
							and were informed of the selected criteria and assessment date.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button
							onClick={() =>
								acknowledge.mutate({
									assessmentId: evaluation.id,
									type: "criteria_participation",
								})
							}
							disabled={acknowledge.isPending}
						>
							{acknowledge.isPending ? "Recording…" : "Confirm participation"}
						</Button>
					</CardContent>
				</Card>
			) : null}
			{isEvaluatedPerson && evaluation.submittedAt && !resultAck ? (
				<Card>
					<CardHeader>
						<CardTitle>Acknowledge assessment result</CardTitle>
						<CardDescription>
							This confirms participation in the discussion and receipt of the
							result. It does not mean that you agree with the result.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button
							onClick={() =>
								acknowledge.mutate({
									assessmentId: evaluation.id,
									type: "result_receipt",
								})
							}
							disabled={acknowledge.isPending}
						>
							{acknowledge.isPending
								? "Recording…"
								: "Confirm discussion and receipt"}
						</Button>
					</CardContent>
				</Card>
			) : null}
			{isEvaluatedPerson &&
			!["completed", "cancelled"].includes(evaluation.status) &&
			pendingRequests.length === 0 ? (
				<Card>
					<CardHeader>
						<CardTitle>Request a date change</CardTitle>
						<CardDescription>
							Propose a new assessment date and explain the reason. The assigned
							evaluator will record a decision.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form
							ref={dateRequestFormRef}
							onSubmit={submitDateRequest}
							className="grid gap-4 sm:grid-cols-2"
						>
							<div className="grid gap-2">
								<Label htmlFor="proposedDate">Proposed date</Label>
								<input
									className="h-9 rounded-md border bg-background px-3 text-sm"
									type="date"
									id="proposedDate"
									name="proposedDate"
									required
								/>
							</div>
							<div className="grid gap-2 sm:col-span-2">
								<Label htmlFor="dateChangeReason">Reason</Label>
								<Textarea
									id="dateChangeReason"
									name="reason"
									required
									rows={3}
								/>
							</div>
							<Button type="submit" disabled={requestChange.isPending}>
								{requestChange.isPending ? "Sending…" : "Send date request"}
							</Button>
						</form>
					</CardContent>
				</Card>
			) : null}
			{evaluation.dateChangeRequests.length > 0 ? (
				<Card>
					<CardHeader>
						<CardTitle>Assessment date requests</CardTitle>
						<CardDescription>
							Request status and evaluator decisions are recorded with
							assessment history.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{evaluation.dateChangeRequests.map((request) => (
							<DateChangeRequest
								key={request.id}
								request={request}
								canDecide={canDecide}
								onDecide={(status, decisionNote) =>
									decideChange.mutate({
										requestId: request.id,
										status,
										decisionNote,
									})
								}
								pending={decideChange.isPending}
							/>
						))}
					</CardContent>
				</Card>
			) : null}
			{error ? (
				<p role="alert" className="text-sm text-destructive">
					{error}
				</p>
			) : null}
		</div>
	);
}

function DateChangeRequest({
	request,
	canDecide,
	onDecide,
	pending,
}: {
	request: EvaluationDetails["dateChangeRequests"][number];
	canDecide: boolean;
	onDecide: (status: "approved" | "rejected", note: string) => void;
	pending: boolean;
}) {
	const [decisionNote, setDecisionNote] = useState(request.decisionNote ?? "");
	return (
		<section className="space-y-3 rounded-lg border p-4">
			<div className="flex flex-wrap justify-between gap-2">
				<h3 className="font-medium">
					Proposed {formatDate(request.proposedDate)}
				</h3>
				<span className="text-sm capitalize text-muted-foreground">
					{request.status}
				</span>
			</div>
			<p className="text-sm text-muted-foreground">{request.reason}</p>
			{request.decisionNote ? (
				<p className="text-sm">Decision: {request.decisionNote}</p>
			) : null}
			{canDecide && request.status === "pending" ? (
				<div className="space-y-2">
					<Label htmlFor={`decision-${request.id}`}>
						Decision note (required)
					</Label>
					<Textarea
						id={`decision-${request.id}`}
						value={decisionNote}
						onChange={(event) => setDecisionNote(event.target.value)}
						rows={2}
					/>
					<div className="flex gap-2">
						<Button
							size="sm"
							disabled={pending || !decisionNote.trim()}
							onClick={() => onDecide("approved", decisionNote)}
						>
							Approve
						</Button>
						<Button
							size="sm"
							variant="outline"
							disabled={pending || !decisionNote.trim()}
							onClick={() => onDecide("rejected", decisionNote)}
						>
							Reject
						</Button>
					</div>
				</div>
			) : null}
		</section>
	);
}

function formatDate(date: Date | null) {
	return date
		? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date)
		: "—";
}
