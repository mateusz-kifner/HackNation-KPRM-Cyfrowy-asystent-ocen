import type { ToolDefinition } from "@/components/chatbot/chatbot-types";
import { trpcClient } from "@/integrations/tanstack-query/root-provider";

export const searchEvaluationsTool: ToolDefinition = {
	type: "function",
	function: {
		name: "search_evaluations",
		description:
			"Search evaluation records the signed-in user is allowed to see by employee name, evaluator name, position, organizational unit, or evaluation ID.",
		parameters: {
			type: "object",
			properties: {
				query: {
					type: "string",
					description: "A name, position, unit, or evaluation ID fragment.",
				},
			},
			required: ["query"],
		},
	},
};

export async function handleSearchEvaluations(args: Record<string, unknown>) {
	if (typeof args.query !== "string" || args.query.trim().length === 0) {
		return { error: "A non-empty search query is required." };
	}

	return trpcClient.evaluations.search.query({ query: args.query.trim() });
}
