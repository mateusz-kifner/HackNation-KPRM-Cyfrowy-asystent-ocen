import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IconMessageChatbot } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { ChatBotPanel } from "./ChatBotPanel";
import type { ToolDefinition, ToolHandler } from "./chatbot-types";
import { useChatbotChat } from "./use-chatbot-chat";
import { IconPinned, IconPin, IconRotate, IconX } from "@tabler/icons-react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import useChatPinState from "#/hooks/use-chat-pin-state";
import { useIsMobile } from "#/hooks/use-mobile";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import {
	DEFAULT_CHATBOT_WINDOW_STATE,
	useChatbotWindowState,
} from "./use-chatbot-window-state";

/**
 * Widget shell: it decides where the panel lives (portal when pinned, floating
 * when not) and wires the transcript composable to the header and composer.
 */
export function ChatBot({
	systemPrompt = "You are a helpful assistant. Format responses with Markdown when it improves readability.",
	tools = [],
	toolHandlers = {},
	title = "Chatbot",
	username,
}: {
	systemPrompt?: string;
	tools?: ToolDefinition[];
	toolHandlers?: Record<string, ToolHandler>;
	title?: string;
	username?: string;
}) {
	const [open, setOpen] = useState(false);
	const [pinned, setPinned] = useChatPinState(false);
	const isMobile = useIsMobile();
	const effectivePinned = pinned && !isMobile;
	const [, setWindowState] = useChatbotWindowState();
	const rapidClickState = useRef({ count: 0, startedAt: 0 });
	const [draft, setDraft] = useState("");
	const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
		null,
	);

	const { visibleMessages, loading, error, send, reset, stop } = useChatbotChat({
		systemPrompt,
		tools,
		toolHandlers,
	});

	useEffect(() => {
		if (typeof document === "undefined") {
			return;
		}

		let container = document.getElementById("CHATBOT");
		if (!container) {
			container = document.createElement("div");
			container.id = "CHATBOT";
			document.body.appendChild(container);
		}
		setPortalContainer(container);
	}, [effectivePinned]);

	useEffect(() => {
		if (isMobile && pinned) setPinned(false);
	}, [isMobile, pinned, setPinned]);

	function handleSend(content: string) {
		setDraft("");
		void send(content);
	}

	function handleClose() {
		setPinned(false);
		setOpen(false);
	}

	function handleTogglePin() {
		setPinned((prev) => !prev);
	}

	function handleLauncherClick() {
		const now = Date.now();
		const clickState = rapidClickState.current;
		if (now - clickState.startedAt > 1200) {
			clickState.count = 0;
			clickState.startedAt = now;
		}
		clickState.count += 1;

		if (clickState.count === 6) {
			rapidClickState.current = { count: 0, startedAt: 0 };
			setPinned(false);
			setWindowState(DEFAULT_CHATBOT_WINDOW_STATE);
			setOpen(true);
			return;
		}

		setOpen((previous) => !previous);
	}

	const headerButtons = (
		<>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="ghost"
						size="icon-sm"
						aria-label="Reset conversation"
						onClick={reset}
					>
						<IconRotate />
					</Button>
				</TooltipTrigger>
				<TooltipContent>Reset conversation</TooltipContent>
			</Tooltip>

			{!isMobile && (
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="icon-sm"
							aria-label={effectivePinned ? "Unpin" : "Pin"}
							onClick={handleTogglePin}
						>
							{effectivePinned ? <IconPinned /> : <IconPin />}
						</Button>
					</TooltipTrigger>
					<TooltipContent>{effectivePinned ? "Unpin" : "Pin"}</TooltipContent>
				</Tooltip>
			)}

			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="ghost"
						size="icon-sm"
						aria-label="Close"
						onClick={handleClose}
					>
						<IconX />
					</Button>
				</TooltipTrigger>
				<TooltipContent>Close</TooltipContent>
			</Tooltip>
		</>
	);

	const panel = isMobile ? (
		<Drawer open={open} onOpenChange={setOpen}>
			<DrawerContent className="h-[90dvh] max-h-[90dvh] gap-0 rounded-t-2xl border-0 bg-transparent p-0 data-[vaul-drawer-direction=bottom]:mt-0 data-[vaul-drawer-direction=bottom]:max-h-[90dvh] [&>div:first-child]:hidden">
				<DrawerTitle className="sr-only">{title}</DrawerTitle>
				<ChatBotPanel
					title={title}
					pinned={false}
					mobile
					messages={visibleMessages}
					username={username}
					loading={loading}
					error={error}
					draft={draft}
					onDraftChange={setDraft}
					onSubmit={handleSend}
					onStop={stop}
					headerButtons={headerButtons}
				/>
			</DrawerContent>
		</Drawer>
	) : (
		<ChatBotPanel
			title={title}
			pinned={effectivePinned}
			messages={visibleMessages}
			username={username}
			loading={loading}
			error={error}
			draft={draft}
			onDraftChange={setDraft}
			onSubmit={handleSend}
			onStop={stop}
			headerButtons={headerButtons}
		/>
	);

	const shouldRender = effectivePinned || open;
	const container = typeof document === "undefined" ? null : portalContainer;

	return (
		<>
			{!effectivePinned ? (
				<Button
					size="icon"
					aria-label="Toggle chatbot"
					className="fixed right-6 bottom-6 z-50 size-14 rounded-full shadow-lg"
					onClick={handleLauncherClick}
				>
					<IconMessageChatbot />
				</Button>
			) : null}
			{shouldRender && container ? createPortal(panel, container) : null}
		</>
	);
}

export default ChatBot;
