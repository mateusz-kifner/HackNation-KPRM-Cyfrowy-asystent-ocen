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
import { useChatbotDrag } from "./use-chatbot-drag";
import { useChatbotResize } from "./use-chatbot-resize";
import { useChatbotWindowState } from "./use-chatbot-window-state";
import type { ChatMessage } from "./chatbot-types";

type ChatBotPanelProps = {
	title?: string;
	pinned?: boolean;
	mobile?: boolean;
	messages: ChatMessage[];
	loading?: boolean;
	error?: string | null;
	username?: string;
	draft?: string;
	onDraftChange?: (value: string) => void;
	onSubmit?: (content: string) => void;
	onStop?: () => void;
	headerButtons?: React.ReactNode;
};

export function ChatBotPanel({
	title = "Chatbot",
	pinned = false,
	mobile = false,
	messages = [],
	loading = false,
	error = null,
	username,
	draft = "",
	onDraftChange = () => {},
	onSubmit = () => {},
	onStop,
	headerButtons,
}: ChatBotPanelProps) {
	const [windowState, setWindowState] = useChatbotWindowState();
	const isFloating = !pinned && !mobile;
	const drag = useChatbotDrag(isFloating, setWindowState);
	const resize = useChatbotResize(isFloating, windowState, setWindowState);

	return (
		<>
			{isFloating && (
				<div
					ref={drag.ref}
					aria-hidden="true"
					className="pointer-events-none fixed inset-0"
				/>
			)}
			<Card
				ref={drag.windowRef}
				style={
					pinned || mobile
						? undefined
						: {
								width: `min(${windowState.width}px, 90vw)`,
								height: `min(${windowState.height}px, calc(100vh - 8rem))`,
								left: `calc(100vw - min(${windowState.width}px, 90vw) - 1.5rem + ${windowState.x}px)`,
								top: `calc(100vh - min(${windowState.height}px, calc(100vh - 8rem)) - 6rem + ${windowState.y}px)`,
							}
				}
				className={cn(
					"z-50 flex flex-col gap-0 overflow-hidden border bg-background/95 p-0 shadow-2xl backdrop-blur",
					mobile
						? "relative h-full min-h-0 w-full min-w-0 max-w-none rounded-t-2xl"
						: pinned
							? "relative h-full min-h-0 w-full min-w-0 max-w-none rounded-none"
							: "fixed max-h-[calc(100vh-8rem)] max-w-[90vw] rounded-2xl",
				)}
			>
				<CardHeader className="items-center border-b bg-muted/40 pt-4">
					<CardTitle
						onMouseDown={drag.startDragWithMouse}
						onTouchStart={drag.startDragWithTouch}
						className={cn(
							"flex items-center gap-2 text-base font-semibold",
							isFloating && "cursor-move touch-none select-none",
							drag.active && "cursor-grabbing",
						)}
					>
						<span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
							<IconMessageChatbot className="size-4" />
						</span>
						<span className="truncate">{title}</span>
					</CardTitle>
					<CardAction className="flex items-center gap-1 self-center">
						{headerButtons}
					</CardAction>
				</CardHeader>
				<CardContent className="flex min-h-0 flex-1 flex-col gap-4 p-0">
					<div className="min-h-0 flex-1">
						<ChatbotMessageList
							messages={messages}
							loading={loading}
							error={error}
							username={username}
						/>
					</div>
					<div className="px-4 pb-4">
						<ChatbotComposer
							value={draft}
							disabled={loading}
							loading={loading}
							onChange={onDraftChange}
							onSubmit={onSubmit}
							onStop={onStop}
						/>
					</div>
				</CardContent>
				{isFloating && (
					<div
						{...resize}
						role="separator"
						aria-label="Resize chatbot window"
						aria-orientation="horizontal"
						className="absolute right-0 bottom-0 z-10 flex size-3 cursor-nwse-resize touch-none items-center justify-center text-muted-foreground hover:text-foreground"
					>
						<span className="size-3 border-r-2 border-b-2 border-current" />
					</div>
				)}
			</Card>
		</>
	);
}

export default ChatBotPanel;
