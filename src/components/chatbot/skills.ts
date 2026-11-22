import type { ToolDefinition } from "@/components/chatbot/chatbot-types";
import { myEvaluationSkill } from "@/components/chatbot/my-evaluation-skill";

export type ChatbotSkill = {
	id: string;
	name: string;
	description: string;
	content: string;
};

export const chatbotSkills: readonly ChatbotSkill[] = [
	{
		id: "my_evaluations",
		name: "My evaluations guide",
		description:
			"Workflow and reference guidance for understanding and completing employee evaluations.",
		content: myEvaluationSkill,
	},
];

export const listSkillsTool: ToolDefinition = {
	type: "function",
	function: {
		name: "list_skills",
		description: "List available guidance skills and when to use them.",
		parameters: { type: "object", properties: {}, required: [] },
	},
};

export const loadSkillTool: ToolDefinition = {
	type: "function",
	function: {
		name: "load_skill",
		description: "Load the full guidance content of an available skill by ID.",
		parameters: {
			type: "object",
			properties: {
				skill_id: {
					type: "string",
					enum: chatbotSkills.map((skill) => skill.id),
					description: "The ID of the skill to load, from list_skills.",
				},
			},
			required: ["skill_id"],
		},
	},
};

export function handleListSkills() {
	return {
		skills: chatbotSkills.map(({ id, name, description }) => ({
			id,
			name,
			description,
		})),
	};
}

export function handleLoadSkill({ skill_id }: Record<string, unknown>) {
	if (typeof skill_id !== "string") {
		return { error: "A skill ID is required." };
	}

	const skill = chatbotSkills.find((candidate) => candidate.id === skill_id);
	if (!skill) {
		return {
			error: `Unknown skill ID. Available skills: ${chatbotSkills.map(({ id }) => id).join(", ") || "none"}.`,
		};
	}

	return { id: skill.id, name: skill.name, content: skill.content };
}
