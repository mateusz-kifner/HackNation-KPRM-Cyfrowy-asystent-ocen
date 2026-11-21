import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IconMessageChatbot } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChatbotComposer } from "./chatbot-composer";
import { ChatbotHeader } from "./chatbot-header";
import { ChatbotMessageList } from "./chatbot-message-list";
import type { ToolDefinition, ToolHandler } from "./chatbot-types";
import { useChatbotChat } from "./use-chatbot-chat";

/**
 * Widget shell: it decides where the panel lives (portal when pinned, floating
 * when not) and wires the transcript composable to the header and composer.
 */
export function Chatbot({
  systemPrompt = "You are a helpful assistant.",
  tools = [],
  toolHandlers = {},
  title = "Chatbot",
}: {
  systemPrompt?: string;
  tools?: ToolDefinition[];
  toolHandlers?: Record<string, ToolHandler>;
  title?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [draft, setDraft] = useState("");
  const portalContainerRef = useRef<HTMLElement | null>(null);

  const { visibleMessages, loading, error, send, reset } = useChatbotChat({
    systemPrompt,
    tools,
    toolHandlers,
  });

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    let container = document.getElementById("CHATBOT");
    if (!container) {
      container = document.createElement("div");
      container.id = "CHATBOT";
      document.body.appendChild(container);
    }
    portalContainerRef.current = container;
  }, []);

  function handleSend(content: string) {
    setDraft("");
    void send(content);
  }

  function handleClose() {
    setPinned(false);
    setOpen(false);
  }

  const panel = (
    <Card
      className={cn(
        "z-50 flex flex-col overflow-hidden rounded-2xl border bg-background/95 shadow-2xl backdrop-blur",
        pinned
          ? "relative w-[420px] max-w-[90vw]"
          : "fixed right-6 bottom-24 h-[80vh] max-h-[800px] w-[420px] max-w-[90vw]"
      )}
    >
      <ChatbotHeader
        title={title}
        pinned={pinned}
        onReset={reset}
        onTogglePin={() => setPinned((previous) => !previous)}
        onClose={handleClose}
      />
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4 p-0">
        <div className="min-h-0 flex-1">
          <ChatbotMessageList
            messages={visibleMessages}
            loading={loading}
            error={error}
          />
        </div>
        <div className="px-4 pb-4">
          <ChatbotComposer
            value={draft}
            disabled={loading}
            onChange={setDraft}
            onSubmit={handleSend}
          />
        </div>
      </CardContent>
    </Card>
  );

  const shouldRender = pinned || open;
  const container =
    typeof document === "undefined"
      ? null
      : (portalContainerRef.current ?? document.body);

  return (
    <>
      {!pinned ? (
        <Button
          size="icon"
          aria-label="Toggle chatbot"
          className="fixed right-6 bottom-6 z-50 size-14 rounded-full shadow-lg"
          onClick={() => setOpen((previous) => !previous)}
        >
          <IconMessageChatbot />
        </Button>
      ) : null}
      {shouldRender && container
        ? createPortal(panel, container)
        : null}
    </>
  );
}

export default Chatbot;
