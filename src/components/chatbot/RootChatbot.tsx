import { useNavigate } from "@tanstack/react-router";
import { authClient } from "#/lib/auth-client";
import {
	createNavigateToPageHandler,
	createNavigateToPageTool,
} from "@/ai-tools/navigate-to-page";
import { handleSearchUsers, searchUsersTool } from "@/ai-tools/search-users";
import { editFormFieldTool, getFormStateTool, selectFormFieldTool } from "@/ai-tools/form-tools";
import { ChatBot } from "@/components/chatbot/ChatBot";
import { useFormToolContext } from "@/components/form-tool-context";

export function RootChatbot() {
	const formToolContext = useFormToolContext();
	const navigate = useNavigate();
	const { data: session } = authClient.useSession();
	const role = (session?.user as { role?: string } | undefined)?.role;
	const isAdmin = role === "Admin";
	const isManager = role === "Manager" || isAdmin;

	const basePaths = ["/", "/me", "/settings"] as const;
	const evaluationPaths = ["/evaluation", "/evaluation/add"] as const;
	const allowedPaths = [
		...basePaths,
		...(isManager ? evaluationPaths : []),
		...(isAdmin ? ["/admin", "/admin/", "/admin/users", "/admin/users/new", "/admin/employees", "/admin/ai-settings"] : []),
	];

	const navigateTool = createNavigateToPageTool(allowedPaths);

	return (
		<ChatBot
			systemPrompt={`You are a helpful assistant. The user is asking for a change off the current page only when they explicitly request navigation or a page change (for example, “go to evaluations”, “open my profile”, or “take me to admin users”). Only then call navigate_to_page, and only for the destination they asked for. Do not navigate because a page is relevant to the conversation, because you recommend it, or because they mention a page while asking a question. If they ask for information or help without requesting a page change, stay on the current page. Available destinations for this ${role ?? "Employee"} user are: ${allowedPaths.join(", ")}. Never navigate to a destination outside this list. When the user asks about the form they are filling out, call get_form_state first. Use select_form_field to focus and highlight a field by its name or id; you can supply a color in that same call if requested. Only use edit_form_field after selecting that same field, and only change fields the user asked you to change.`}
			tools={[navigateTool, getFormStateTool, selectFormFieldTool, editFormFieldTool, ...(isAdmin ? [searchUsersTool] : [])]}
			toolHandlers={{
				navigate_to_page: createNavigateToPageHandler(
					allowedPaths,
					(path) => navigate({ to: path }),
				),
				...(isAdmin ? { search_users: handleSearchUsers } : {}),
				get_form_state: () => formToolContext.getFormState(),
				select_form_field: ({ name, color }) => typeof name === "string" && (color === undefined || typeof color === "string") ? formToolContext.selectField(name, color as string | undefined) : { success: false, error: "A field name and optional string color are required." },
				edit_form_field: ({ name, value }) => typeof name === "string" && typeof value === "string" ? formToolContext.editField(name, value) : { success: false, error: "A field name and string value are required." },
			}}
			username={session?.user?.name ?? undefined}
			title="AI Assistant"
		/>
	);
}
