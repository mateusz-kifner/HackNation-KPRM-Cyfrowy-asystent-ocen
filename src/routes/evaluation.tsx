import { Navigate, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/evaluation")({
	component: EvaluationHomePage,
});

function EvaluationHomePage() {
	return <Navigate to="/evaluation/running" />;
}
