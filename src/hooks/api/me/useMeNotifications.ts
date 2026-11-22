import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/integrations/trpc/react";

export function useMeNotifications() {
	const trpc = useTRPC();
	return useQuery(trpc.notifications.list.queryOptions());
}
