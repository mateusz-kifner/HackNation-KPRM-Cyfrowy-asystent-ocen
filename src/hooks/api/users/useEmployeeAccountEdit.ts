import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/integrations/trpc/react";

export function useEmployeeAccountEdit(
	options?: Parameters<
		ReturnType<typeof useTRPC>["users"]["updateEmployee"]["mutationOptions"]
	>[0],
) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	return useMutation(
		trpc.users.updateEmployee.mutationOptions({
			...options,
			onSuccess: async (...args) => {
				await queryClient.invalidateQueries({
					queryKey: trpc.users.employees.queryKey(),
				});
				await options?.onSuccess?.(...args);
			},
		}),
	);
}
