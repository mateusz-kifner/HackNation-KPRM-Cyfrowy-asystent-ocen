import { Navigate, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/evaluation/completed")({
	component: () => <Navigate to="/evaluation" />,
});
