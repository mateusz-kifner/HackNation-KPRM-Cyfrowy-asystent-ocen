import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/integrations/trpc/react";

export function useEvaluationRecordReviewOutcome() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	return useMutation(
		trpc.evaluations.recordReviewOutcome.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries({
					queryKey: trpc.evaluations.list.queryKey(),
				});
			},
		}),
	);
}
