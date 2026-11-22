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
import { Sheet, SheetContent } from "@/components/ui/sheet";

/**
 * Widget shell: it decides where the panel lives (portal when pinned, floating
 * when not) and wires the transcript composable to the header and composer.
 */
export function ChatBot({
	systemPrompt = "You are a helpful assistant.",
	tools = [],
	toolHandlers = {},
	title = "Chatbot",
}: {
	systemPrompt?: string;
	tools?: ToolDefinition[];
	toolHandlers?: Record<string, ToolHandler>;
	title?: string;
}) {
	const [open, setOpen] = useState(false);
	const [pinned, setPinned] = useChatPinState(false);
	const [draft, setDraft] = useState("");
	const portalContainerRef = useRef<HTMLElement | null>(null);

	useEffect(() => {
		const desktop = window.matchMedia("(min-width: 768px)");
		const syncPinToViewport = () => {
			if (!desktop.matches) setPinned(false);
		};
		syncPinToViewport();
		desktop.addEventListener("change", syncPinToViewport);
		return () => desktop.removeEventListener("change", syncPinToViewport);
	}, [setPinned]);

	const { visibleMessages, loading, error, send, reset } = useChatbotChat(
		{
			systemPrompt,
			tools,
			toolHandlers,
		},
	);

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
		portalContainerRef.current = container;
	}, []);

	function handleSend(content: string) {
		setDraft("");
		void send(content);
	}

	function handleClose() {
		setPinned(false);
		setOpen(false);
	}

	function handleTogglePin() {
		if (!window.matchMedia("(min-width: 768px)").matches) return;
		setPinned((prev) => !prev);
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

			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="ghost"
						size="icon-sm"
						aria-label={pinned ? "Unpin" : "Pin"}
						onClick={handleTogglePin}
						className="max-md:hidden"
					>
						{pinned ? <IconPinned /> : <IconPin />}
					</Button>
				</TooltipTrigger>
				<TooltipContent>{pinned ? "Unpin" : "Pin"}</TooltipContent>
			</Tooltip>

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

	const panel = (
		<ChatBotPanel
			title={title}
			pinned={pinned}
			messages={visibleMessages}
			loading={loading}
			error={error}
			draft={draft}
			onDraftChange={setDraft}
			onSubmit={handleSend}
			headerButtons={headerButtons}
		/>
	);

	const shouldRender = pinned || open;
	const container =
		typeof document === "undefined"
			? null
			: (portalContainerRef.current ?? document.body);

	return (
		<>
			{pinned && shouldRender && container
				? createPortal(panel, container)
				: null}
			{!pinned ? (
				<Sheet open={open} onOpenChange={setOpen}>
					<Button
						size="icon"
						aria-label="Toggle chatbot"
						className="fixed right-6 bottom-6 z-50 size-14 rounded-full shadow-lg"
						onClick={() => setOpen(true)}
					>
						<IconMessageChatbot />
					</Button>
					<SheetContent
						side="right"
						showCloseButton={false}
						className="w-[min(100vw,420px)] max-w-none p-0"
					>
						{open ? panel : null}
					</SheetContent>
				</Sheet>
			) : null}
		</>
	);
}

export default ChatBot;
