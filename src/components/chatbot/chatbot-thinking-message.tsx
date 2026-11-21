import { IconLoader2 } from "@tabler/icons-react";
import { Message, MessageContent } from "@/components/ui/message";

/** Placeholder shown while the model is answering. */
export function ChatbotThinkingMessage() {
  return (
    <Message>
      <MessageContent>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <IconLoader2 className="size-4 animate-spin" />
          Thinking…
        </p>
      </MessageContent>
    </Message>
  );
}

export default ChatbotThinkingMessage;
