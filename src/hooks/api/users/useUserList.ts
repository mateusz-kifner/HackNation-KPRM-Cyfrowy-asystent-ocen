import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/integrations/trpc/react";

export function useUserList(query?: string) {
	const trpc = useTRPC();
	return useQuery(trpc.users.list.queryOptions(query ? { query } : undefined));
}
