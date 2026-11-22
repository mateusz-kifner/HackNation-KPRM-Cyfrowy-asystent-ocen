import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/integrations/trpc/react";

export function useEvaluationsForMe() {
	const trpc = useTRPC();
	return useQuery(trpc.evaluations.evaluatedForMe.queryOptions());
}
