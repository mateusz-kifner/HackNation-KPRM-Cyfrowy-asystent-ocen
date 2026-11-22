import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/integrations/trpc/react";

export function useMeMarkAllNotificationsRead() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	return useMutation(
		trpc.notifications.markAllRead.mutationOptions({
			onSuccess: () =>
				queryClient.invalidateQueries({
					queryKey: trpc.notifications.list.queryKey(),
				}),
		}),
	);
}
