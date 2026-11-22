import { createFileRoute } from "@tanstack/react-router";
import { EvaluationsIndexPage } from "@/routes/evaluations/[index]";

export const Route = createFileRoute("/evaluation")({
	component: EvaluationsIndexPage,
});
