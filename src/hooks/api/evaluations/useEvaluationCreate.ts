import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/integrations/trpc/react";

export function useEvaluationCreate(
	options?: Parameters<
		ReturnType<typeof useTRPC>["evaluations"]["create"]["mutationOptions"]
	>[0],
) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	return useMutation(
		trpc.evaluations.create.mutationOptions({
			...options,
			onSuccess: async (...args) => {
				await queryClient.invalidateQueries({
					queryKey: trpc.evaluations.assignedToMe.queryKey(),
				});
				await options?.onSuccess?.(...args);
			},
		}),
	);
}
