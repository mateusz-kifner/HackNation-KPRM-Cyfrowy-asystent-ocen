import { IconRobot } from "@tabler/icons-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { ChatbotErrorMessage } from "./chatbot-error-message";
import { ChatbotMessage } from "./chatbot-message";
import { ChatbotThinkingMessage } from "./chatbot-thinking-message";
import type { ChatMessage } from "./chatbot-types";

/**
 * Renders the transcript in an auto-scrolling scroller. Every turn gets its own
 * `MessageScrollerItem` with a stable `messageId`, which is what lets the
 * scroller anchor the newest user turn and keep the reading position otherwise.
 */
export function ChatbotMessageList({
  messages,
  loading,
  error,
  username,
}: {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  username?: string;
}) {
  const visibleMessages = messages.filter((message) => message.content.trim() !== "");
  const lastUserMessageId = [...visibleMessages]
    .reverse()
    .find((message) => message.role === "user")?.id;

  if (visibleMessages.length === 0 && !loading && !error) {
    return (
      <Empty className="m-0 h-full min-h-0 rounded-none border-0">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconRobot />
          </EmptyMedia>
          <EmptyTitle>Welcome{username ? `, ${username}` : ""}!</EmptyTitle>
          <EmptyDescription>
            How can I help you?
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <MessageScroller autoScroll className="h-full">
      <MessageScrollerViewport>
        <MessageScrollerContent aria-busy={loading} className="gap-6 px-8 py-4">
          {visibleMessages.map((message) => (
            <MessageScrollerItem
              key={message.id}
              messageId={message.id}
              scrollAnchor={message.id === lastUserMessageId}
            >
              <ChatbotMessage message={message} />
            </MessageScrollerItem>
          ))}
          {error ? (
            <MessageScrollerItem>
              <ChatbotErrorMessage message={error} />
            </MessageScrollerItem>
          ) : null}
          {loading ? (
            <MessageScrollerItem>
              <ChatbotThinkingMessage />
            </MessageScrollerItem>
          ) : null}
        </MessageScrollerContent>
      </MessageScrollerViewport>
      <MessageScrollerButton />
    </MessageScroller>
  );
}

export default ChatbotMessageList;
