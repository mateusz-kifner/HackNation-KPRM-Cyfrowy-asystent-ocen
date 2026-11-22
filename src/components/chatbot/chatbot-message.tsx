import { ChatbotAssistantMessage } from "./chatbot-assistant-message";
import { ChatbotToolMessage } from "./chatbot-tool-message";
import { ChatbotUserMessage } from "./chatbot-user-message";
import type { ChatMessage } from "./chatbot-types";

/** Picks the renderer that matches a message role. */
export function ChatbotMessage({ message }: { message: ChatMessage }) {
	switch (message.role) {
		case "user":
			return <ChatbotUserMessage message={message} />;
		case "tool":
			return <ChatbotToolMessage message={message} />;
		default:
			return <ChatbotAssistantMessage message={message} />;
	}
}

export default ChatbotMessage;
