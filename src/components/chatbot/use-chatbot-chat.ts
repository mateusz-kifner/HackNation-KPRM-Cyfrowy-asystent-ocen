import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  ChatMessage,
  NewChatMessage,
  ToolDefinition,
  ToolHandler,
} from "./chatbot-types";
import { runChatTurn } from "./chatbot-api";

let messageCounter = 0;

function nextMessageId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  messageCounter += 1;
  return `message-${messageCounter}`;
}

function withIds(messages: NewChatMessage[]): ChatMessage[] {
  return messages.map((message) => ({
    ...message,
    id: nextMessageId(),
    timestamp: message.timestamp ?? new Date().toISOString(),
  }));
}

const builtinDatetimeTool: ToolDefinition = {
  type: "function",
  function: {
    name: "get_datetime",
    description: "Get the current date and time",
    parameters: { type: "object", properties: {}, required: [] },
  },
};

const builtinHandlers: Record<string, ToolHandler> = {
  get_datetime: () => new Date().toISOString(),
};

export type UseChatbotChat = {
  messages: ChatMessage[];
  /** Everything except the system prompt, in render order. */
  visibleMessages: ChatMessage[];
  loading: boolean;
  error: string | null;
  send: (content: string) => Promise<void>;
  reset: () => void;
};

/**
 * Owns the transcript, the request lifecycle and the tool loop. The model is
 * `AI_CONFIG.model` on purpose: one hardcoded model, no selection in the UI.
 */
export function useChatbotChat({
  systemPrompt,
  tools = [],
  toolHandlers = {},
}: {
  systemPrompt: string;
  tools?: ToolDefinition[];
  toolHandlers?: Record<string, ToolHandler>;
}): UseChatbotChat {
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    withIds([{ role: "system", content: systemPrompt }])
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesRef = useRef<ChatMessage[]>(messages);
  messagesRef.current = messages;

  const visibleMessages = useMemo(
    () => messages.filter((message) => message.role !== "system"),
    [messages]
  );

  useEffect(() => {
    setMessages(withIds([{ role: "system", content: systemPrompt }]));
    setError(null);
  }, [systemPrompt]);

  const effectiveTools = useMemo(() => {
    const hasDatetime = tools.some((tool) => tool.function.name === "get_datetime");
    return hasDatetime ? tools : [builtinDatetimeTool, ...tools];
  }, [tools]);

  const effectiveHandlers = useMemo<Record<string, ToolHandler>>(
    () => ({ ...builtinHandlers, ...toolHandlers }),
    [toolHandlers]
  );

  const append = useCallback((message: NewChatMessage) => {
    setMessages((previous) => [...previous, ...withIds([message])]);
  }, []);

  const send = useCallback(
    async (rawContent: string) => {
      const content = rawContent.trim();
      if (!content || loading) {
        return;
      }

      const history = [...messagesRef.current, ...withIds([{ role: "user", content }])];
      messagesRef.current = history;
      setMessages(history);
      setError(null);
      setLoading(true);

      try {
        await runChatTurn({
          history,
          tools: effectiveTools,
          handlers: effectiveHandlers,
          onMessage: append,
        });
      } catch (caught) {
        // The transcript stays clean: the failure is shown as its own row via
        // `error` rather than being pushed into the conversation history.
        setError(caught instanceof Error ? caught.message : String(caught));
      } finally {
        setLoading(false);
      }
    },
    [append, effectiveHandlers, effectiveTools, loading]
  );

  const reset = useCallback(() => {
    setMessages(withIds([{ role: "system", content: systemPrompt }]));
    setError(null);
    setLoading(false);
  }, [systemPrompt]);

  return { messages, visibleMessages, loading, error, send, reset };
}
