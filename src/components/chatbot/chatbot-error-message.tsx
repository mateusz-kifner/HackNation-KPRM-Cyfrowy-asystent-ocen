import { IconAlertCircle } from "@tabler/icons-react";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Message, MessageContent } from "@/components/ui/message";

/** Failure of the last request, kept separate from model output. */
export function ChatbotErrorMessage({ message }: { message: string }) {
  return (
    <Message>
      <MessageContent>
        <Bubble variant="destructive">
          <BubbleContent className="flex items-start gap-2">
            <IconAlertCircle className="size-4 shrink-0" />
            <span>{message}</span>
          </BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  );
}

export default ChatbotErrorMessage;
