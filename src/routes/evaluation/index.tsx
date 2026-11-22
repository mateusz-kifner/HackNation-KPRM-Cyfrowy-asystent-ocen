import { createFileRoute } from "@tanstack/react-router";
import { EvaluationDocumentsPage } from "#/components/evaluation-documents-page";

export const Route = createFileRoute("/evaluation/")({
	component: EvaluationDocumentsPage,
});
