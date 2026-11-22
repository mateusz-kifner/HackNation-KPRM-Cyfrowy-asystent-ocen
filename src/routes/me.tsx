import { createFileRoute } from "@tanstack/react-router";
import { MeEvaluationsPage } from "#/components/me-evaluations-page";

export const Route = createFileRoute("/me")({
	component: MePage,
});

function MePage() {
	return <MeEvaluationsPage />;
}
