import { Navigate, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/evaluation/running")({
	component: () => <Navigate to="/evaluation" />,
});
