import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/integrations/trpc/react";

export function useUserSearch(query: string) {
	const trpc = useTRPC();
	const normalizedQuery = query.trim();
	return useQuery({
		...trpc.users.search.queryOptions({ query: normalizedQuery || " " }),
		enabled: normalizedQuery.length > 0,
	});
}
