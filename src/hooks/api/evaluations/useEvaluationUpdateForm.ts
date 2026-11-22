import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/integrations/trpc/react";

export function useEvaluationUpdateForm() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(trpc.evaluations.updateForm.mutationOptions({
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: trpc.evaluations.list.queryKey() });
      await queryClient.invalidateQueries({ queryKey: trpc.evaluations.assignedToMe.queryKey() });
      await queryClient.invalidateQueries({ queryKey: trpc.evaluations.evaluatedForMe.queryKey() });
    },
  }));
}
