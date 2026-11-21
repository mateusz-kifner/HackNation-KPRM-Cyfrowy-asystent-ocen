import { Message, MessageContent, MessageFooter } from "@/components/ui/message";
import type { ChatMessage } from "./chatbot-types";

/**
 * Assistant output. The shadcn chat example keeps replies outside of bubbles;
 * this project has no markdown renderer, so text stays plain and preserves newlines.
 */
export function ChatbotAssistantMessage({ message }: { message: ChatMessage }) {
  return (
    <Message>
      <MessageContent>
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        {message.timestamp && (
          <MessageFooter className="ms-0 text-xs text-muted-foreground">
            {new Date(message.timestamp).toLocaleTimeString()}
          </MessageFooter>
        )}
      </MessageContent>
    </Message>
  );
}

export default ChatbotAssistantMessage;
