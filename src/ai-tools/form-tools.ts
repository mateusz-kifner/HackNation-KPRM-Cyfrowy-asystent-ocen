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

export const setFormHighlightColorTool: ToolDefinition = {
	type: "function",
	function: {
		name: "set_form_highlight_color",
		description: "Change the highlight color for all fields currently highlighted by AI and any fields highlighted later.",
		parameters: {
			type: "object",
			properties: { color: { type: "string", description: "A CSS color such as #ff6600, red, or rgb(255, 102, 0)." } },
			required: ["color"],
		},
	},
};
