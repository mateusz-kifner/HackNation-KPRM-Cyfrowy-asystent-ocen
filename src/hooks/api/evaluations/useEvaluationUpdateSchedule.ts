import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/integrations/trpc/react";

export function useEvaluationUpdateSchedule(
	options?: Parameters<
		ReturnType<
			typeof useTRPC
		>["evaluations"]["updateSchedule"]["mutationOptions"]
	>[0],
) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	return useMutation(
		trpc.evaluations.updateSchedule.mutationOptions({
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
				]);
				await options?.onSuccess?.(...args);
			},
		}),
	);
}
