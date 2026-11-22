import { useNavigate } from "@tanstack/react-router";
import { authClient } from "#/lib/auth-client";
import {
	createNavigateToPageHandler,
	navigateToPageTool,
} from "@/ai-tools/navigate-to-page";
import { handleSearchUsers, searchUsersTool } from "@/ai-tools/search-users";
import { ChatBot } from "@/components/chatbot/ChatBot";

export function RootChatbot() {
	const navigate = useNavigate();
	const { data: session } = authClient.useSession();
	const isAdmin =
		(session?.user as { role?: string } | undefined)?.role === "Admin";

	return (
		<ChatBot
			systemPrompt="You are a helpful assistant. You can use navigate_to_page to navigate between / and /me without reloading the app."
			tools={[navigateToPageTool, ...(isAdmin ? [searchUsersTool] : [])]}
			toolHandlers={{
				navigate_to_page: createNavigateToPageHandler((path) =>
					navigate({ to: path }),
				),
				...(isAdmin ? { search_users: handleSearchUsers } : {}),
			}}
			title="AI Assistant"
		/>
	);
}
