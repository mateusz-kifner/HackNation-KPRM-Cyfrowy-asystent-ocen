import { Message, MessageContent } from "@/components/ui/message";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { ChatbotMarkdown } from "./chatbot-markdown";
import type { ChatMessage } from "./chatbot-types";

/** Assistant output, rendered as Markdown outside of a message bubble. */
export function ChatbotAssistantMessage({ message }: { message: ChatMessage }) {
	return (
		<Message>
			<MessageContent>
				<Bubble variant="tinted">
					<BubbleContent>
						<ChatbotMarkdown content={message.content} />
					</BubbleContent>
				</Bubble>
			</MessageContent>
		</Message>
	);
}

export default ChatbotAssistantMessage;
