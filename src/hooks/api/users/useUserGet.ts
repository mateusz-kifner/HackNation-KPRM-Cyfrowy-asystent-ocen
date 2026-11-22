import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/integrations/trpc/react";

export function useUserGet(id: string) {
	const trpc = useTRPC();
	return useQuery(trpc.users.get.queryOptions({ id }));
}
