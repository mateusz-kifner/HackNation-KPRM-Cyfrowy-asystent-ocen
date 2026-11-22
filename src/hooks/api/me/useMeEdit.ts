import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/integrations/trpc/react";

export function useMeEdit(
	options?: Parameters<
		ReturnType<typeof useTRPC>["me"]["update"]["mutationOptions"]
	>[0],
) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	return useMutation(
		trpc.me.update.mutationOptions({
			...options,
			onSuccess: async (...args) => {
				await queryClient.invalidateQueries({
					queryKey: trpc.me.get.queryKey(),
				});
				await options?.onSuccess?.(...args);
			},
		}),
	);
}
