import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/integrations/trpc/react";

export type EvaluationListFilters = {
	query?: string;
	status?:
		| "draft"
		| "criteria_setting"
		| "ready_for_assessment"
		| "assessment_in_progress"
		| "awaiting_employee_acknowledgement"
		| "completed"
		| "cancelled";
	evaluatorUserId?: string;
	evaluatedUserId?: string;
	overdueOnly?: boolean;
};

export function useEvaluationList(filters?: EvaluationListFilters) {
	const trpc = useTRPC();
	return useQuery(trpc.evaluations.list.queryOptions(filters));
}
