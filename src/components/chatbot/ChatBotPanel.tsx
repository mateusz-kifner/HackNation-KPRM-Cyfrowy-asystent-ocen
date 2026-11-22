import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardAction,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { IconMessageChatbot } from "@tabler/icons-react";
import { ChatbotComposer } from "./chatbot-composer";
import { ChatbotMessageList } from "./chatbot-message-list";
import type { ChatMessage } from "./chatbot-types";

type ChatBotPanelProps = {
	title?: string;
	pinned?: boolean;
	messages: ChatMessage[];
	loading?: boolean;
	error?: string | null;
	draft?: string;
	onDraftChange?: (value: string) => void;
	onSubmit?: (content: string) => void;
	headerButtons?: React.ReactNode;
};

export function ChatBotPanel({
	title = "Chatbot",
	pinned = false,
	messages = [],
	loading = false,
	error = null,
	draft = "",
	onDraftChange = () => {},
	onSubmit = () => {},
	headerButtons,
}: ChatBotPanelProps) {
	return (
		<Card
			className={cn(
				"z-50 flex h-full min-h-0 flex-col overflow-hidden border bg-background/95 shadow-2xl backdrop-blur data-[pinned=true]:rounded-none",
				pinned ? "relative w-full rounded-none" : "h-full w-full rounded-none",
			)}
			data-pinned={pinned}
		>
			<CardHeader className="border-b bg-muted/40">
				<CardTitle className="flex items-center gap-2 text-base font-semibold">
					<span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
						<IconMessageChatbot className="size-4" />
					</span>
					<span className="truncate">{title}</span>
				</CardTitle>
				<CardAction className="flex items-center gap-1">
					{headerButtons}
				</CardAction>
			</CardHeader>
			<CardContent className="flex min-h-0 flex-1 flex-col gap-4 p-0">
				<div className="min-h-0 flex-1">
					<ChatbotMessageList
						messages={messages}
						loading={loading}
						error={error}
					/>
				</div>
				<div className="px-4 pb-4">
					<ChatbotComposer
						value={draft}
						disabled={loading}
						onChange={onDraftChange}
						onSubmit={onSubmit}
					/>
				</div>
			</CardContent>
		</Card>
	);
}

export default ChatBotPanel;
