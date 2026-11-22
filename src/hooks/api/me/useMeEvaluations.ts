import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/integrations/trpc/react";

export function useMeEvaluations() {
	const trpc = useTRPC();
	return useQuery(trpc.evaluations.assignedToMe.queryOptions());
}
