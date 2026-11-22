import { Message, MessageContent } from "@/components/ui/message";
import { ChatbotMarkdown } from "./chatbot-markdown";
import type { ChatMessage } from "./chatbot-types";

/** Assistant output, rendered as Markdown outside of a message bubble. */
export function ChatbotAssistantMessage({ message }: { message: ChatMessage }) {
	return (
		<Message>
			<MessageContent>
				<ChatbotMarkdown content={message.content} />
			</MessageContent>
		</Message>
	);
}

export default ChatbotAssistantMessage;
