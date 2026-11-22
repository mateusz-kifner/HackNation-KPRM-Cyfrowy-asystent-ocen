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

	const basePaths = ["/", "/me"] as const;
	const allowedPaths = [
		...basePaths,
		...(isManager ? ["/evaluation"] : []),
		...(isAdmin ? ["/admin", "/admin/"] : []),
	];

	const navigateTool = createNavigateToPageTool(allowedPaths);

	return (
		<ChatBot
			systemPrompt={`You are a helpful assistant. You can use navigate_to_page to navigate between ${allowedPaths.join(", ")} without reloading the app. When the user asks about the form they are filling out, call get_form_state first. Use select_form_field to focus and highlight a field by its name or id; you can supply a color in that same call if requested. Only use edit_form_field after selecting that same field, and only change fields the user asked you to change.`}
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
