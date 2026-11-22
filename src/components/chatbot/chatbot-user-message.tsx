import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Message, MessageContent } from "@/components/ui/message";
import type { ChatMessage } from "./chatbot-types";

/** The visitor's own turn, right aligned in a bubble, like the shadcn chat example. */
export function ChatbotUserMessage({ message }: { message: ChatMessage }) {
	return (
		<Message align="end">
			<MessageContent>
				<Bubble align="end" variant="muted">
					<BubbleContent className="whitespace-pre-wrap">
						{message.content}
					</BubbleContent>
				</Bubble>
			</MessageContent>
		</Message>
	);
}

export default ChatbotUserMessage;
