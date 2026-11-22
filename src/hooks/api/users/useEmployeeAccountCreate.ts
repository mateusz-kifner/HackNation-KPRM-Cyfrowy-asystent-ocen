import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/integrations/trpc/react";

export function useEmployeeAccountCreate(
	options?: Parameters<
		ReturnType<typeof useTRPC>["users"]["createEmployee"]["mutationOptions"]
	>[0],
) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	return useMutation(
		trpc.users.createEmployee.mutationOptions({
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
