import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/integrations/trpc/react";

export function useEvaluationCalculateResult(
	assessmentId: string,
	enabled = true,
) {
	const trpc = useTRPC();
	return useQuery({
		...trpc.evaluations.calculateResult.queryOptions({ assessmentId }),
		enabled,
	});
}
