import { useState } from "react";
import { useFormTool } from "#/components/form-tool-context";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/integrations/trpc/react";
import { useEvaluationSelectForm } from "#/hooks/api/evaluations/useEvaluationSelectForm";
import { useEvaluationUpdateCriteria } from "#/hooks/api/evaluations/useEvaluationUpdateCriteria";
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

export function CriteriaEditor({
	evaluation,
	isAdmin = false,
}: {
	evaluation: EvaluationDetails;
	isAdmin?: boolean;
}) {
	const criteriaFormRef = useFormTool("Evaluation criteria");
	const trpc = useTRPC();
	const options = useQuery(trpc.evaluations.options.queryOptions());
	const [selectedAdditional, setSelectedAdditional] = useState<string[]>(
		evaluation.criteria
			.filter((criterion) => !criterion.mandatory)
			.map((criterion) => criterion.title),
	);
	const [reason, setReason] = useState("");
	const [error, setError] = useState<string | null>(null);
	const changeForm = useEvaluationSelectForm({
		onError: (cause) => setError(cause.message),
	});
	const saveCriteria = useEvaluationUpdateCriteria({
		onError: (cause) => setError(cause.message),
	});
	const canChangeForm =
		isAdmin ||
		!evaluation.acknowledgements.some(
			(item) => item.type === "criteria_participation",
		);
	const mandatory = evaluation.criteria.filter(
		(criterion) => criterion.mandatory,
	);
	const additionalCatalog = options.data?.additionalCriteria ?? [];

	function toggleAdditional(title: string) {
		setSelectedAdditional((current) =>
			current.includes(title)
				? current.filter((item) => item !== title)
				: current.length < 3
					? [...current, title]
					: current,
		);
	}

	function save(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		const criteria = [
			...mandatory,
			...selectedAdditional.map(
				(title) =>
					evaluation.criteria.find((item) => item.title === title) ?? {
						code: `additional-${title}`,
						title,
						mandatory: false,
						description: null,
						duties: null,
						expectations: null,
						goals: null,
						measurementMethod: null,
					},
			),
		].map((criterion) => ({
			code: criterion.code,
			title: criterion.title,
			mandatory: criterion.mandatory,
			description: criterion.description,
			duties: String(data.get(`${criterion.code}-duties`) ?? "") || null,
			expectations:
				String(data.get(`${criterion.code}-expectations`) ?? "") || null,
			goals: String(data.get(`${criterion.code}-goals`) ?? "") || null,
			measurementMethod:
				String(data.get(`${criterion.code}-measurement`) ?? "") || null,
		}));
		setError(null);
		saveCriteria.mutate({
			assessmentId: evaluation.id,
			criteria,
			reason: reason || null,
		});
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Prepare criteria</CardTitle>
				<CardDescription>
					Select the applicable form, required criteria, and up to three
					additional criteria before the employee acknowledges participation.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-5">
				{canChangeForm ? (
					<div className="grid gap-2 sm:max-w-xs">
						<Label htmlFor="assessment-form">Assessment form</Label>
						<select
							id="assessment-form"
							className="h-9 rounded-md border bg-background px-3 text-sm"
							value={evaluation.form ?? "A"}
							disabled={isAdmin && !reason.trim()}
							onChange={(event) => {
								setError(null);
								changeForm.mutate({
									assessmentId: evaluation.id,
									form: event.target.value as "A" | "B" | "C",
									reason: reason || null,
								});
							}}
						>
							<option value="A">Form A</option>
							<option value="B">Form B</option>
							<option value="C">Form C</option>
						</select>
					</div>
				) : null}
				{isAdmin ? (
					<div className="grid gap-2">
						<Label htmlFor="criteria-correction-reason">
							Admin correction reason
						</Label>
						<Textarea
							id="criteria-correction-reason"
							value={reason}
							onChange={(event) => setReason(event.target.value)}
							rows={2}
							required
						/>
					</div>
				) : null}
				{options.isLoading ? (
					<p className="text-sm text-muted-foreground">Loading criteria…</p>
				) : null}
				{options.isError ? (
					<p role="alert" className="text-sm text-destructive">
						Could not load the criterion catalog.
					</p>
				) : null}
				{canChangeForm ? (
					<fieldset className="space-y-2">
						<legend className="text-sm font-medium">
							Additional criteria ({selectedAdditional.length}/3)
						</legend>
						<div className="flex flex-wrap gap-2">
							{additionalCatalog.map((title) => (
								<label
									key={title}
									className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm"
								>
									<input
										type="checkbox"
										checked={selectedAdditional.includes(title)}
										onChange={() => toggleAdditional(title)}
										disabled={
											!selectedAdditional.includes(title) &&
											selectedAdditional.length >= 3
										}
									/>
									{title}
								</label>
							))}
						</div>
					</fieldset>
				) : null}
				{canChangeForm ? (
					<form ref={criteriaFormRef} onSubmit={save} className="space-y-5">
						{[
							...mandatory,
							...selectedAdditional.map(
								(title) =>
									evaluation.criteria.find((item) => item.title === title) ?? {
										id: title,
										code: `additional-${title}`,
										title,
										mandatory: false,
										description: null,
										duties: null,
										expectations: null,
										goals: null,
										measurementMethod: null,
									},
							),
						].map((criterion) => (
							<section
								key={criterion.code}
								className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2"
							>
								<div className="sm:col-span-2">
									<h3 className="font-medium">
										{criterion.title}
										{criterion.mandatory ? " · required" : ""}
									</h3>
								</div>
								<Field
									name={`${criterion.code}-duties`}
									label="Duties"
									defaultValue={criterion.duties}
								/>
								<Field
									name={`${criterion.code}-expectations`}
									label="Expectations"
									defaultValue={criterion.expectations}
								/>
								<Field
									name={`${criterion.code}-goals`}
									label="Goals"
									defaultValue={criterion.goals}
								/>
								<Field
									name={`${criterion.code}-measurement`}
									label="How it will be measured"
									defaultValue={criterion.measurementMethod}
								/>
							</section>
						))}
						<div className="space-y-2">
							{error ? (
								<p role="alert" className="text-sm text-destructive">
									{error}
								</p>
							) : null}
							<Button
								type="submit"
								disabled={
									saveCriteria.isPending ||
									!evaluation.form ||
									(isAdmin && !reason.trim())
								}
							>
								{saveCriteria.isPending ? "Saving…" : "Save criteria"}
							</Button>
						</div>
					</form>
				) : (
					<p className="text-sm text-muted-foreground">
						Criteria are locked after employee acknowledgement.
					</p>
				)}
			</CardContent>
		</Card>
	);
}

function Field({
	name,
	label,
	defaultValue,
}: {
	name: string;
	label: string;
	defaultValue: string | null;
}) {
	return (
		<div className="grid gap-2">
			<Label htmlFor={name}>{label}</Label>
			<Textarea
				id={name}
				name={name}
				defaultValue={defaultValue ?? ""}
				rows={2}
			/>
		</div>
	);
}
