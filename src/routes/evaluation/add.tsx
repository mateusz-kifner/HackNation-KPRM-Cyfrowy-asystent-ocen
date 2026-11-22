import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createFileRoute,
	Link,
	Navigate,
	useNavigate,
} from "@tanstack/react-router";
import { IconArrowLeft, IconPlus } from "@tabler/icons-react";
import { useState, type FormEvent } from "react";
import { useFormTool } from "#/components/form-tool-context";
import { useTRPC } from "#/integrations/trpc/react";
import { authClient } from "#/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/evaluation/add")({
	component: AddEvaluationPage,
});

type FormValues = {
	evaluatedUserId: string;
	evaluatorUserId: string;
	form: "A" | "B" | "C";
	periodStart: string;
	periodEnd: string;
	criteriaDiscussionAt: string;
	assessmentDate: string;
	assessmentDiscussionAt: string;
	dueAt: string;
	agencyName: string;
	evaluatedPersonType: "civil_service_official" | "civil_service_employee";
	evaluatedOrganizationalUnit: string;
	evaluatedPosition: string;
	evaluatorOrganizationalUnit: string;
	evaluatorPosition: string;
	criteriaDiscussionLocation: string;
};

const emptyForm: FormValues = {
	evaluatedUserId: "",
	evaluatorUserId: "",
	form: "A",
	periodStart: "",
	periodEnd: "",
	criteriaDiscussionAt: "",
	assessmentDate: "",
	assessmentDiscussionAt: "",
	dueAt: "",
	agencyName: "",
	evaluatedPersonType: "civil_service_employee",
	evaluatedOrganizationalUnit: "",
	evaluatedPosition: "",
	evaluatorOrganizationalUnit: "",
	evaluatorPosition: "",
	criteriaDiscussionLocation: "",
};

function AddEvaluationPage() {
	const { data: session, isPending } = authClient.useSession();
	const role = (session?.user as { role?: string } | undefined)?.role;
	if (!isPending && role !== "Admin" && role !== "Manager")
		return <Navigate to="/evaluation/running" />;
	if (isPending) return null;
	return <EvaluationCreationForm />;
}

function EvaluationCreationForm() {
	const formRef = useFormTool("Add evaluation");
	const [values, setValues] = useState(emptyForm);
	const [error, setError] = useState<string | null>(null);
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const candidatesQuery = useQuery(trpc.evaluations.candidates.queryOptions());
	const createEvaluation = useMutation(
		trpc.evaluations.create.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries({
					queryKey: trpc.evaluations.assignedToMe.queryKey(),
				});
				await navigate({ to: "/evaluation/upcoming" });
			},
			onError: (mutationError) => setError(mutationError.message),
		}),
	);
	const candidates = candidatesQuery.data ?? [];

	function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
		setValues((current) => ({ ...current, [key]: value }));
	}

	function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);
		const asDate = (value: string) =>
			value ? new Date(`${value}T00:00:00`) : null;
		createEvaluation.mutate({
			evaluatedUserId: values.evaluatedUserId,
			evaluatorUserId: values.evaluatorUserId,
			form: values.form,
			periodStart: asDate(values.periodStart),
			periodEnd: asDate(values.periodEnd),
			criteriaDiscussionAt: asDate(values.criteriaDiscussionAt),
			assessmentDate: asDate(values.assessmentDate),
			assessmentDiscussionAt: asDate(values.assessmentDiscussionAt),
			dueAt: asDate(values.dueAt),
			file: {
				agencyName: values.agencyName || null,
				evaluatedPersonType: values.evaluatedPersonType,
				evaluatedOrganizationalUnit: values.evaluatedOrganizationalUnit || null,
				evaluatedPosition: values.evaluatedPosition || null,
				evaluatorOrganizationalUnit: values.evaluatorOrganizationalUnit || null,
				evaluatorPosition: values.evaluatorPosition || null,
				criteriaDiscussionLocation: values.criteriaDiscussionLocation || null,
			},
		});
	}

	if (candidatesQuery.isLoading)
		return (
			<main className="mx-auto max-w-4xl p-6 text-sm text-muted-foreground">
				Loading employees…
			</main>
		);
	if (candidatesQuery.isError)
		return (
			<main
				className="mx-auto max-w-4xl p-6 text-sm text-destructive"
				role="alert"
			>
				Could not load employees. Refresh the page and try again.
			</main>
		);

	return (
		<main className="mx-auto w-full max-w-4xl space-y-6 p-4 sm:p-6">
			<Link
				to="/evaluation/running"
				className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
			>
				<IconArrowLeft className="size-4" />
				Back to evaluations
			</Link>
			<header>
				<h1 className="text-2xl font-semibold tracking-tight">
					Add evaluation
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Assign an evaluator, set the schedule, and fill in the evaluation file
					details.
				</p>
			</header>
			<form ref={formRef} onSubmit={submit} className="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>Participants and schedule</CardTitle>
						<CardDescription>
							Choose the employee, evaluator, assessment form, and key dates.
						</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-5 sm:grid-cols-2">
						<div className="grid gap-2">
							<Label htmlFor="evaluatedUserId">Employee being evaluated</Label>
							<Select
								name="evaluatedUserId"
								value={values.evaluatedUserId}
								onValueChange={(value) => {
									const person = candidates.find(
										(candidate) => candidate.id === value,
									);
									update("evaluatedUserId", value);
									if (person) {
										update("evaluatedPosition", person.position ?? "");
										update(
											"evaluatedOrganizationalUnit",
											person.organizationalUnit ?? "",
										);
									}
								}}
							>
								<SelectTrigger id="evaluatedUserId">
									<SelectValue placeholder="Select employee" />
								</SelectTrigger>
								<SelectContent>
									{candidates
										.filter((candidate) => candidate.role === "Employee")
										.map((candidate) => (
											<SelectItem key={candidate.id} value={candidate.id}>
												{candidate.name} · {candidate.email}
											</SelectItem>
										))}
								</SelectContent>
							</Select>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="evaluatorUserId">Evaluator</Label>
							<Select
								name="evaluatorUserId"
								value={values.evaluatorUserId}
								onValueChange={(value) => {
									const person = candidates.find(
										(candidate) => candidate.id === value,
									);
									update("evaluatorUserId", value);
									if (person) {
										update("evaluatorPosition", person.position ?? "");
										update(
											"evaluatorOrganizationalUnit",
											person.organizationalUnit ?? "",
										);
									}
								}}
							>
								<SelectTrigger id="evaluatorUserId">
									<SelectValue placeholder="Select evaluator" />
								</SelectTrigger>
								<SelectContent>
									{candidates
										.filter(
											(candidate) => candidate.id !== values.evaluatedUserId,
										)
										.map((candidate) => (
											<SelectItem key={candidate.id} value={candidate.id}>
												{candidate.name} · {candidate.role}
											</SelectItem>
										))}
								</SelectContent>
							</Select>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="form">Evaluation form</Label>
							<Select
								name="form"
								value={values.form}
								onValueChange={(value) =>
									update("form", value as FormValues["form"])
								}
							>
								<SelectTrigger id="form">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="A">Form A</SelectItem>
									<SelectItem value="B">Form B</SelectItem>
									<SelectItem value="C">Form C</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<TextField
							label="Assessment period starts"
							type="date"
							value={values.periodStart}
							onChange={(value) => update("periodStart", value)}
						/>
						<TextField
							label="Assessment period ends"
							type="date"
							value={values.periodEnd}
							onChange={(value) => update("periodEnd", value)}
						/>
						<TextField
							label="Criteria discussion date"
							type="date"
							value={values.criteriaDiscussionAt}
							onChange={(value) => update("criteriaDiscussionAt", value)}
						/>
						<TextField
							label="Assessment date"
							type="date"
							value={values.assessmentDate}
							onChange={(value) => update("assessmentDate", value)}
						/>
						<TextField
							label="Assessment discussion date"
							type="date"
							value={values.assessmentDiscussionAt}
							onChange={(value) => update("assessmentDiscussionAt", value)}
						/>
						<TextField
							label="Due date"
							type="date"
							value={values.dueAt}
							onChange={(value) => update("dueAt", value)}
						/>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Evaluation file</CardTitle>
						<CardDescription>
							These values are saved with the assessment document and can be
							edited later.
						</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-5 sm:grid-cols-2">
						<TextField
							label="Agency / institution"
							value={values.agencyName}
							onChange={(value) => update("agencyName", value)}
						/>
						<div className="grid gap-2">
							<Label htmlFor="personType">Employee type</Label>
							<Select
								name="evaluatedPersonType"
								value={values.evaluatedPersonType}
								onValueChange={(value) =>
									update(
										"evaluatedPersonType",
										value as FormValues["evaluatedPersonType"],
									)
								}
							>
								<SelectTrigger id="personType">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="civil_service_employee">
										Civil service employee
									</SelectItem>
									<SelectItem value="civil_service_official">
										Civil service official
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<TextField
							label="Employee organizational unit"
							value={values.evaluatedOrganizationalUnit}
							onChange={(value) => update("evaluatedOrganizationalUnit", value)}
						/>
						<TextField
							label="Employee position"
							value={values.evaluatedPosition}
							onChange={(value) => update("evaluatedPosition", value)}
						/>
						<TextField
							label="Evaluator organizational unit"
							value={values.evaluatorOrganizationalUnit}
							onChange={(value) => update("evaluatorOrganizationalUnit", value)}
						/>
						<TextField
							label="Evaluator position"
							value={values.evaluatorPosition}
							onChange={(value) => update("evaluatorPosition", value)}
						/>
						<TextField
							label="Criteria discussion location"
							value={values.criteriaDiscussionLocation}
							onChange={(value) => update("criteriaDiscussionLocation", value)}
						/>
					</CardContent>
				</Card>
				{error && (
					<p role="alert" className="text-sm text-destructive">
						{error}
					</p>
				)}
				<div className="flex justify-end">
					<Button
						type="submit"
						disabled={
							createEvaluation.isPending ||
							!values.evaluatedUserId ||
							!values.evaluatorUserId
						}
					>
						<IconPlus className="size-4" />
						{createEvaluation.isPending ? "Creating…" : "Create evaluation"}
					</Button>
				</div>
			</form>
		</main>
	);
}

function TextField({
	label,
	value,
	onChange,
	type = "text",
}: {
	label: string;
	value: string;
	onChange: (value: string) => void;
	type?: string;
}) {
	const id = label.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-");
	return (
		<div className="grid gap-2">
			<Label htmlFor={id}>{label}</Label>
			<Input
				id={id}
				name={id}
				type={type}
				value={value}
				onChange={(event) => onChange(event.target.value)}
			/>
		</div>
	);
}
