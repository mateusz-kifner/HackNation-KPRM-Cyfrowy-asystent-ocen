import { IconTool } from "@tabler/icons-react";
import { Message, MessageContent } from "@/components/ui/message";
import { Trace, TraceIcon, TraceLine, TraceTitle } from "@/components/ui/trace";
import type { ChatMessage } from "./chatbot-types";

/** A single tool result, shown as a trace line plus its raw payload. */
export function ChatbotToolMessage({ message }: { message: ChatMessage }) {
  return (
    <Message>
      <MessageContent className="gap-2">
        <Trace>
          <TraceLine>
            <TraceIcon>
              <IconTool />
            </TraceIcon>
            <TraceTitle>Called {message.name ?? "a tool"}</TraceTitle>
          </TraceLine>
        </Trace>
        <pre className="max-w-full overflow-x-auto rounded-lg border bg-muted/40 px-3 py-2 font-mono text-xs wrap-break-word text-muted-foreground">
          {message.content}
        </pre>
      </MessageContent>
    </Message>
  );
}

export default ChatbotToolMessage;
