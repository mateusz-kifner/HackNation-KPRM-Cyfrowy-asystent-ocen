import { toolDefinition } from "@tanstack/ai";
import { fetchServerSentEvents, useChat } from "@tanstack/ai-react";
import { useMemo, useRef } from "react";
import { toChatMessages } from "./chatbot-message-adapter";
import type { ToolDefinition, ToolHandler } from "./chatbot-types";

const datetimeTool: ToolDefinition = {
	type: "function",
	function: {
		name: "get_datetime",
		description: "Get the current date and time",
		parameters: { type: "object", properties: {}, required: [] },
	},
};

function createClientTools(
	definitions: ToolDefinition[],
	handlers: Record<string, ToolHandler>,
) {
	return definitions.map((definition) => {
		const { name, description = "", parameters } = definition.function;
		const execute = handlers[name];
		return toolDefinition({
			name,
			description,
			inputSchema: parameters as never,
		}).client(
			execute ? (args: Record<string, unknown>) => execute(args) : undefined,
		);
	});
}

export function useChatbotChat({
	systemPrompt,
	tools = [],
	toolHandlers = {},
}: {
	systemPrompt: string;
	tools?: ToolDefinition[];
	toolHandlers?: Record<string, ToolHandler>;
}) {
	const threadId = useRef<string>(
		typeof crypto !== "undefined" && "randomUUID" in crypto
			? crypto.randomUUID()
			: `chat-${Date.now()}`,
	);
	const effectiveTools = useMemo(() => {
		const hasDatetime = tools.some(
			(tool) => tool.function.name === "get_datetime",
		);
		return createClientTools(hasDatetime ? tools : [datetimeTool, ...tools], {
			get_datetime: () => new Date().toISOString(),
			...toolHandlers,
		});
	}, [tools, toolHandlers]);
	const chat = useChat({
		connection: fetchServerSentEvents("/api/chat"),
		threadId: threadId.current,
		tools: effectiveTools as never,
		forwardedProps: { systemPrompt },
		queue: "drop",
	});

	return {
		visibleMessages: toChatMessages(chat.messages),
		loading: chat.isLoading,
		error: chat.error?.message ?? null,
		send: (content: string) => chat.sendMessage(content),
		reset: chat.clear,
	};
}
