import type { useEvaluationGet } from "#/hooks/api/evaluations/useEvaluationGet";

export type EvaluationDetails = NonNullable<
	ReturnType<typeof useEvaluationGet>["data"]
>;
