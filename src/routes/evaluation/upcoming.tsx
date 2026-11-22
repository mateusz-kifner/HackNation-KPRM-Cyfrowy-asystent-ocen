import { Navigate, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/evaluation/upcoming")({
	component: () => <Navigate to="/evaluation" />,
});
