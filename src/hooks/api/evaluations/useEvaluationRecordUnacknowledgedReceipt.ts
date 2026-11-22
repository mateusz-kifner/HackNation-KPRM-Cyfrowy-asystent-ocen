import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/integrations/trpc/react";

export function useEvaluationRecordUnacknowledgedReceipt() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(trpc.evaluations.recordUnacknowledgedReceipt.mutationOptions({
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: trpc.evaluations.list.queryKey() });
      await queryClient.invalidateQueries({ queryKey: trpc.evaluations.assignedToMe.queryKey() });
      await queryClient.invalidateQueries({ queryKey: trpc.evaluations.evaluatedForMe.queryKey() });
    },
  }));
}
