import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { IconMessageChatbot } from "@tabler/icons-react";
import { ChatbotComposer } from "./chatbot-composer";
import { ChatbotMessageList } from "./chatbot-message-list";
import type { ChatMessage } from "./chatbot-types";

type ChatBotPanelProps = {
  title?: string;
  pinned?: boolean;
  messages: ChatMessage[];
  loading?: boolean;
  error?: string | null;
  draft?: string;
  onDraftChange?: (value: string) => void;
  onSubmit?: (content: string) => void;
  headerButtons?: React.ReactNode;
};

export function ChatBotPanel({
  title = "Chatbot",
  pinned = false,
  messages = [],
  loading = false,
  error = null,
  draft = "",
  onDraftChange,
  onSubmit,
  headerButtons,
}: ChatBotPanelProps) {
  return (
    <Card
      className={cn(
        "z-50 flex flex-col overflow-hidden rounded-2xl border bg-background/95 shadow-2xl backdrop-blur",
        pinned
          ? "relative w-[420px] max-w-[90vw]"
          : "fixed right-6 bottom-24 h-[80vh] max-h-[800px] w-[420px] max-w-[90vw]"
      )}
    >
      <CardHeader className="border-b bg-muted/40">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <IconMessageChatbot className="size-4" />
          </span>
          <span className="truncate">{title}</span>
        </CardTitle>
        <CardAction className="flex items-center gap-1">
          {headerButtons}
        </CardAction>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4 p-0">
        <div className="min-h-0 flex-1">
          <ChatbotMessageList messages={messages} loading={loading} error={error} />
        </div>
        <div className="px-4 pb-4">
          <ChatbotComposer
            value={draft}
            disabled={loading}
            onChange={onDraftChange}
            onSubmit={onSubmit}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default ChatBotPanel;
