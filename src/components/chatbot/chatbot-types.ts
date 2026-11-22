export type ChatMessage = {
	id: string;
	role: "user" | "assistant" | "tool";
	content: string;
	name?: string;
	timestamp?: string;
};

export type ToolDefinition = {
	type: "function";
	function: {
		name: string;
		description?: string;
		parameters: {
			type: "object";
			properties: Record<string, unknown>;
			required?: string[];
		};
	};
};

export type ToolHandler = (
	args: Record<string, unknown>,
) => Promise<unknown> | unknown;
