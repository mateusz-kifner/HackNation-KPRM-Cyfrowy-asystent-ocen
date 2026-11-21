import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Message, MessageContent, MessageFooter } from "@/components/ui/message";
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
        {message.timestamp && (
          <MessageFooter className="ms-0 justify-end text-xs text-muted-foreground">
            {new Date(message.timestamp).toLocaleTimeString()}
          </MessageFooter>
        )}
      </MessageContent>
    </Message>
  );
}

export default ChatbotUserMessage;
