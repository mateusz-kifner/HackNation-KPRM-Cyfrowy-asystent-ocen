import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/integrations/trpc/react";

export function useEvaluationGet(id: string) {
	const trpc = useTRPC();
	return useQuery(trpc.evaluations.get.queryOptions({ id }));
}
