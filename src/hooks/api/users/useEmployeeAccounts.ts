import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/integrations/trpc/react";

export function useEmployeeAccounts(input?: {
	query?: string;
	sortBy?: "name" | "email" | "position" | "department" | "hireDate";
	descending?: boolean;
}) {
	const trpc = useTRPC();
	return useQuery(trpc.users.employees.queryOptions(input ?? {}));
}
