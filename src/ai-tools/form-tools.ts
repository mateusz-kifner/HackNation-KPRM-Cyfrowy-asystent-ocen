import type { ToolDefinition } from "@/components/chatbot/chatbot-types";

export const getFormStateTool: ToolDefinition = {
	type: "function",
	function: {
		name: "get_form_state",
		description: "Get the current values of the active page form as JSON. Password fields are omitted.",
		parameters: { type: "object", properties: {}, required: [] },
	},
};

export const selectFormFieldTool: ToolDefinition = {
	type: "function",
	function: {
		name: "select_form_field",
		description: "Focus, scroll to, and highlight a form field by its name or id.",
		parameters: {
			type: "object",
			properties: { name: { type: "string", description: "The form field name or id." } },
			required: ["name"],
		},
	},
};
