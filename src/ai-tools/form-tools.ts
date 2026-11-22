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
		description: "If user asks you to show any field use this tool. Focus, scroll to, and highlight a form field by its name or id. Optional basic colors",
		parameters: {
			type: "object",
			properties: {
				name: { type: "string", description: "The form field name or id." },
				color: { type: "string", description: "Optional basic color name (mapped to a Tailwind shade) or another valid CSS color." },
			},
			required: ["name"],
		},
	},
};

export const editFormFieldTool: ToolDefinition = {
	type: "function",
	function: {
		name: "edit_form_field",
		description: "Set the value of a form field that was previously selected with select_form_field. Fields that have not been selected cannot be edited.",
		parameters: {
			type: "object",
			properties: {
				name: { type: "string", description: "The name or id of a field already selected with select_form_field." },
				value: { type: "string", description: "The new field value. For checkboxes, use true or false." },
			},
			required: ["name", "value"],
		},
	},
};
