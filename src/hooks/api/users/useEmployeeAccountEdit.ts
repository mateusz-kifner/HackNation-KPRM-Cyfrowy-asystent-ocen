import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/integrations/trpc/react";

export function useEmployeeAccountEdit() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	return useMutation(
		trpc.users.updateEmployee.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries({
					queryKey: trpc.users.employees.queryKey(),
				});
			},
		}),
	);
}
