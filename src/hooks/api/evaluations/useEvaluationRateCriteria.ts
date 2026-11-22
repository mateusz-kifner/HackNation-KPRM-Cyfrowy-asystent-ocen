import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/integrations/trpc/react";

export function useEvaluationRateCriteria(
	options?: Parameters<
		ReturnType<typeof useTRPC>["evaluations"]["rateCriteria"]["mutationOptions"]
	>[0],
) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	return useMutation(
		trpc.evaluations.rateCriteria.mutationOptions({
			...options,
			onSuccess: async (...args) => {
				await Promise.all([
					queryClient.invalidateQueries({
						queryKey: trpc.evaluations.list.queryKey(),
					}),
					queryClient.invalidateQueries({
						queryKey: trpc.evaluations.assignedToMe.queryKey(),
					}),
					queryClient.invalidateQueries({
						queryKey: trpc.evaluations.evaluatedForMe.queryKey(),
					}),
					queryClient.invalidateQueries({
						queryKey: trpc.evaluations.get.queryKey(),
					}),
					queryClient.invalidateQueries({
						queryKey: trpc.evaluations.calculateResult.queryKey(),
					}),
				]);
				await options?.onSuccess?.(...args);
			},
		}),
	);
}
