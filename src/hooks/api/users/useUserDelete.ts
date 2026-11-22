import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/integrations/trpc/react";

export function useUserDelete(
	options?: Parameters<
		ReturnType<typeof useTRPC>["users"]["delete"]["mutationOptions"]
	>[0],
) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	return useMutation(
		trpc.users.delete.mutationOptions({
			...options,
			onSuccess: async (...args) => {
				await queryClient.invalidateQueries({ queryKey: [["users", "list"]] });
				await options?.onSuccess?.(...args);
			},
		}),
	);
}
