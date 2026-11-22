import { createFileRoute } from "@tanstack/react-router";
import { EvaluationCategoryPage } from "#/components/evaluation-category-page";

export const Route = createFileRoute("/evaluation/completed")({
	component: () => <EvaluationCategoryPage category="completed" />,
});
