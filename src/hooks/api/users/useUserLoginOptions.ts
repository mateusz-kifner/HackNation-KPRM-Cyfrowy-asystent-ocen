import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/integrations/trpc/react";

export function useUserLoginOptions() {
	const trpc = useTRPC();
	return useQuery({
		...trpc.users.loginOptions.queryOptions(),
		refetchInterval: 5_000,
	});
}
