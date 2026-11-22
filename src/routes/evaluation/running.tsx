import { createFileRoute } from "@tanstack/react-router";
import { EvaluationCategoryPage } from "#/components/evaluation-category-page";

export const Route = createFileRoute("/evaluation/running")({
	component: () => <EvaluationCategoryPage category="running" />,
});
