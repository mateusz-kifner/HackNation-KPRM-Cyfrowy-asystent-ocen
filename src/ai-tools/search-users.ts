import type { ToolDefinition } from "@/components/chatbot/chatbot-types";
import { trpcClient } from "@/integrations/tanstack-query/root-provider";

export const searchUsersTool: ToolDefinition = {
	type: "function",
	function: {
		name: "search_users",
		description:
			"Search for users by name or email. Available to administrators only.",
		parameters: {
			type: "object",
			properties: {
				query: {
					type: "string",
					description: "A name or email fragment to search for.",
				},
			},
			required: ["query"],
		},
	},
};

export async function handleSearchUsers({ query }: Record<string, unknown>) {
	if (typeof query !== "string" || query.trim().length === 0) {
		return { error: "A non-empty search query is required." };
	}

	return trpcClient.users.search.query({ query: query.trim() });
}
