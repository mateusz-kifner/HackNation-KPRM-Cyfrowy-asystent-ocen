import { useNavigate, useRouterState } from "@tanstack/react-router";
import { authClient } from "#/lib/auth-client";
import {
	createNavigateToPageHandler,
	createNavigateToPageTool,
} from "@/ai-tools/navigate-to-page";
import { handleSearchUsers, searchUsersTool } from "@/ai-tools/search-users";
import {
	handleSearchEvaluations,
	searchEvaluationsTool,
} from "@/ai-tools/search-evaluations";
import {
	editFormFieldTool,
	getFormStateTool,
	selectFormFieldTool,
} from "@/ai-tools/form-tools";
import { ChatBot } from "@/components/chatbot/ChatBot";
import { getPageContext } from "@/components/chatbot/page-context";
import {
	handleListSkills,
	handleLoadSkill,
	listSkillsTool,
	loadSkillTool,
} from "@/components/chatbot/skills";
import { useFormToolContext } from "@/components/form-tool-context";

export function RootChatbot() {
	const formToolContext = useFormToolContext();
	const navigate = useNavigate();
	const currentPath = useRouterState({
		select: (state) => state.location.pathname,
	});
	const pageContext = getPageContext(currentPath);
	const { data: session, isPending } = authClient.useSession();
	const user = session?.user as
		| { name?: string | null; role?: string; isAnonymous?: boolean }
		| undefined;
	if (isPending || !user || user.isAnonymous) {
		return null;
	}
	const role = user.role;
	const isAdmin = role === "Admin";
	const isManager = role === "Manager" || isAdmin;

	const basePaths = ["/", "/me", "/settings"] as const;
	const evaluationPaths = ["/evaluation", "/evaluation/add"] as const;
	const allowedPaths = [
		...basePaths,
		...(isManager ? evaluationPaths : []),
		...(isManager ? ["/users"] : []),
		...(isAdmin ? ["/users/new", "/settings/cron"] : []),
	];
	const allowedPathPrefixes = [
		"/evaluation/",
		...(isManager ? ["/evaluation/preview/"] : []),
		...(isAdmin ? ["/users/edit/"] : []),
	];

	const navigateTool = createNavigateToPageTool(
		allowedPaths,
		allowedPathPrefixes,
	);

	return (
		<ChatBot
			systemPrompt={`You are a helpful assistant. Current page: ${currentPath} — ${pageContext.title}. Page information: ${pageContext.description} This page context updates when the user navigates. Treat the listed data fields and controls as a guide to what the page contains; do not claim to know current row values unless they are included in the conversation or returned by a tool. The user is asking for a change off the current page only when they explicitly request navigation or a page change (for example, “go to evaluations”, “open my profile”, or “take me to users”). Only then call navigate_to_page, and only for the destination they asked for. Do not navigate because a page is relevant to the conversation, because you recommend it, or because they mention a page while asking a question. If they ask for information or help without requesting a page change, stay on the current page. Available destinations for this ${role ?? "Employee"} user are: ${allowedPaths.join(", ")}.${allowedPathPrefixes.length ? ` Dynamic destinations may use these prefixes followed by one ID segment: ${allowedPathPrefixes.join(", ")}. Use /evaluation/preview/{id} for a document preview and /evaluation/{id} for evaluation details.` : ""} Never navigate to a destination outside these exact paths and dynamic patterns. When the user asks about the form they are filling out, call get_form_state first. Use select_form_field to focus and highlight a field by its name or id; you can supply a color in that same call if requested. Use edit_form_field to edit a field by its name or id directly; selecting or highlighting it first is optional. Only change fields the user asked you to change. Use list_skills to discover relevant guidance and load_skill to read the skill before applying it.`}
			tools={[
				navigateTool,
				getFormStateTool,
				selectFormFieldTool,
				editFormFieldTool,
				searchEvaluationsTool,
				listSkillsTool,
				loadSkillTool,
				...(isAdmin ? [searchUsersTool] : []),
			]}
			toolHandlers={{
				list_skills: handleListSkills,
				load_skill: handleLoadSkill,
				navigate_to_page: createNavigateToPageHandler(
					allowedPaths,
					(path) => navigate({ to: path }),
					allowedPathPrefixes,
				),
				...(isAdmin ? { search_users: handleSearchUsers } : {}),
				search_evaluations: handleSearchEvaluations,
				get_form_state: () => formToolContext.getFormState(),
				select_form_field: ({ name, color }) =>
					typeof name === "string" &&
					(color === undefined || typeof color === "string")
						? formToolContext.selectField(name, color as string | undefined)
						: {
								success: false,
								error: "A field name and optional string color are required.",
							},
				edit_form_field: ({ name, value }) =>
					typeof name === "string" && typeof value === "string"
						? formToolContext.editField(name, value)
						: {
								success: false,
								error: "A field name and string value are required.",
							},
			}}
			username={user.name ?? undefined}
			title="AI Assistant"
		/>
	);
}
