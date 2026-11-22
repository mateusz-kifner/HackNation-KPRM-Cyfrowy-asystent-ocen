import type { ReactNode } from "react";
import { ChatbotAssistantMessage } from "./chatbot-assistant-message";
import { ChatbotCopyButton } from "./chatbot-copy-button";
import { ChatbotToolMessage } from "./chatbot-tool-message";
import type { ChatMessage } from "./chatbot-types";
import { ChatbotUserMessage } from "./chatbot-user-message";

/** Picks the renderer that matches a message role. */
export function ChatbotMessage({ message }: { message: ChatMessage }) {
	let content: ReactNode;
	switch (message.role) {
		case "user":
			content = <ChatbotUserMessage message={message} />;
			break;
		case "tool":
			content = <ChatbotToolMessage message={message} />;
			break;
		default:
			content = <ChatbotAssistantMessage message={message} />;
	}

	return (
		<div
			className={`group/message flex flex-col gap-1 ${message.role === "user" ? "items-end" : "items-start"}`}
		>
			{content}
			{message.role !== "tool" && <ChatbotCopyButton text={message.content} />}
		</div>
	);
}

export default ChatbotMessage;
