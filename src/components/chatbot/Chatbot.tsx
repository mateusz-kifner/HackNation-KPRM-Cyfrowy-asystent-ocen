import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageScroller, MessageScrollerContent, MessageScrollerItem, MessageScrollerViewport, MessageScrollerButton } from "@/components/ui/message-scroller";
import { Message, MessageContent, MessageHeader, MessageFooter, MessageGroup } from "@/components/ui/message";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconMessageChatbot, IconSend, IconX, IconPin, IconPinned } from "@tabler/icons-react";
import { AI_CONFIG } from "@/lib/ai-config";

type ChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_call_id?: string;
  name?: string;
  timestamp?: string;
};

type ToolDefinition = {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters: {
      type: "object";
      properties: Record<string, unknown>;
      required?: string[];
    };
  };
};

type ToolHandler = (args: Record<string, unknown>) => Promise<unknown> | unknown;

export function Chatbot({
  systemPrompt = "You are a helpful assistant.",
  tools = [],
  toolHandlers = {},
  model = "gpt-4o-mini",
  title = "Chatbot",
}: {
  systemPrompt?: string;
  tools?: ToolDefinition[];
  toolHandlers?: Record<string, ToolHandler>;
  model?: string;
  title?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "system", content: systemPrompt },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(model);
  const portalContainerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;
    let el = document.getElementById("CHATBOT");
    if (!el) {
      el = document.createElement("div");
      el.id = "CHATBOT";
      document.body.appendChild(el);
    }
    portalContainerRef.current = el;
  }, []);

  const getDatetimeTool = useMemo(() => ({
    type: "function" as const,
    function: {
      name: "get_datetime",
      description: "Get the current date and time",
      parameters: { type: "object", properties: {}, required: [] },
    },
  }), []);

  const effectiveTools = useMemo(() => {
    const hasDatetime = tools.some(t => t.function.name === "get_datetime");
    const list = hasDatetime ? tools : [getDatetimeTool, ...tools];
    return list;
  }, [tools, getDatetimeTool]);

  const effectiveHandlers = useMemo(() => {
    const base: Record<string, ToolHandler> = {
      get_datetime: () => new Date().toISOString(),
      ...toolHandlers,
    };
    return base;
  }, [toolHandlers]);

  useEffect(() => {
    setMessages([{ role: "system", content: systemPrompt }]);
  }, [systemPrompt]);

  const visibleMessages = messages.filter(m => m.role !== "system");

  const groupedMessages = useMemo(() => {
    const groups: ChatMessage[][] = [];
    let current: ChatMessage[] = [];
    for (const m of visibleMessages) {
      if (current.length === 0 || m.role === current[0].role) {
        current.push(m);
      } else {
        groups.push(current);
        current = [m];
      }
    }
    if (current.length) groups.push(current);
    return groups;
  }, [visibleMessages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim(), timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    setLoading(true);
    try {
      const payload = {
        model: selectedModel,
        messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
        tools: effectiveTools.length ? effectiveTools : undefined,
        tool_choice: "auto",
      };

      let response = await fetch(`${AI_CONFIG.url}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AI_CONFIG.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API error ${response.status}`);
      }

      const data = await response.json();
      const assistantMsg = data.choices?.[0]?.message;

      if (!assistantMsg) {
        throw new Error("Invalid response");
      }

      const assistantContent = assistantMsg.content ?? "";
      const toolCalls = assistantMsg.tool_calls ?? [];

      if (toolCalls.length > 0) {
        setMessages(prev => [...prev, { role: "assistant", content: assistantContent, timestamp: new Date().toISOString() }]);

        for (const call of toolCalls) {
          const fn = call.function;
          const callId = call.id;
          const name = fn.name;
          const args = (() => {
            try { return JSON.parse(fn.arguments || "{}"); } catch { return {}; }
          })();

          const handler = effectiveHandlers[name];
          let toolResult;
          try {
            toolResult = await handler(args);
          } catch (e) {
            toolResult = { error: String(e) };
          }

          setMessages(prev => [
            ...prev,
            { role: "tool", content: JSON.stringify(toolResult), name, tool_call_id: callId, timestamp: new Date().toISOString() },
          ]);

          const followUp = await fetch(`${AI_CONFIG.url}/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${AI_CONFIG.apiKey}`,
            },
            body: JSON.stringify({
              model: selectedModel,
              messages: [
                ...messages,
                userMsg,
                { role: "assistant", content: assistantContent },
                { role: "tool", content: JSON.stringify(toolResult), tool_call_id: callId, name },
              ],
            }),
          });

          const followData = await followUp.json();
          const followMsg = followData.choices?.[0]?.message;
          if (followMsg) {
            setMessages(prev => [...prev, { role: "assistant", content: followMsg.content ?? "", timestamp: new Date().toISOString() }]);
          }
        }
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: assistantContent, timestamp: new Date().toISOString() }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: `Error: ${String(err)}`, timestamp: new Date().toISOString() }]);
    } finally {
      setLoading(false);
    }
  };

  const panel = (
    <Card className={`z-50 flex flex-col rounded-2xl border shadow-2xl bg-background/95 backdrop-blur ${pinned ? "relative w-[420px] max-w-[90vw]" : "fixed bottom-24 right-6 w-[420px] max-w-[90vw] h-[80vh] max-h-[800px]"}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 bg-muted/40 rounded-t-2xl border-b">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <IconMessageChatbot className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1 flex items-center gap-2">
            <CardTitle className="text-base font-semibold truncate">{title}</CardTitle>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="h-7 w-[140px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o-mini">gpt-4o-mini</SelectItem>
                <SelectItem value="gpt-4o">gpt-4o</SelectItem>
                <SelectItem value="claude-3-5-sonnet">claude-3-5-sonnet</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setPinned(p => !p)} className="h-8 w-8" title={pinned ? "Unpin" : "Pin"}>
            {pinned ? <IconPinned className="h-4 w-4" /> : <IconPin className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => { setPinned(false); setOpen(false); }} className="h-8 w-8" title="Close">
            <IconX className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-0 flex flex-col">
        <div className="flex-1 min-h-0 overflow-hidden">
          <MessageScroller className="h-full">
            <MessageScrollerViewport>
              <MessageScrollerContent className="px-4 gap-4">
                {groupedMessages.map((group, gIdx) => {
                  const role = group[0].role;
                  const isAssistant = role === "assistant";
                  const isUser = role === "user";
                  const isTool = role === "tool";
                  const lastIdx = gIdx === groupedMessages.length - 1 && group.length > 0 && visibleMessages.length > 0;
                  const scrollAnchor = lastIdx && group[group.length - 1] === visibleMessages[visibleMessages.length - 1];
                  const senderLabel = isAssistant ? "Assistant" : isUser ? "You" : group[0].name ?? "Tool";
                  return (
                    <MessageScrollerItem key={gIdx} scrollAnchor={scrollAnchor}>
                      <MessageGroup>
                        {group.map((m, mIdx) => {
                          const isFirst = mIdx === 0;
                          return (
                            <Message key={mIdx} align={isAssistant || isTool ? "start" : "end"}>
                              <MessageContent className="max-w-[85%]">
                                {isFirst && (
                                  <MessageHeader className="text-xs font-medium text-muted-foreground">
                                    {senderLabel}
                                  </MessageHeader>
                                )}
                                <div className={`rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${isAssistant || isTool ? "bg-muted" : "bg-primary text-primary-foreground"} max-w-full`}>
                                  {m.content}
                                </div>
                                {m.timestamp && (
                                  <MessageFooter className="text-[10px] text-muted-foreground mt-1">
                                    {new Date(m.timestamp).toLocaleTimeString()}
                                  </MessageFooter>
                                )}
                              </MessageContent>
                            </Message>
                          );
                        })}
                      </MessageGroup>
                    </MessageScrollerItem>
                  );
                })}
                {loading && (
                  <MessageScrollerItem>
                    <Message align="start">
                      <MessageContent className="max-w-[85%]">
                        <div className="rounded-2xl bg-muted px-4 py-3 text-sm">Thinking...</div>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                )}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
        </div>
        <div className="p-3 border-t bg-muted/30">
          <div className="flex gap-2 items-end rounded-2xl border bg-background p-2 shadow-sm">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type a message..."
              disabled={loading}
              rows={1}
              className="flex-1 resize-none min-h-[44px] max-h-[120px] rounded-xl border-0 bg-transparent px-3 py-2 text-sm shadow-none focus-visible:outline-none focus-visible:ring-0 overflow-y-auto"
            />
            <Button onClick={handleSend} disabled={loading || !input.trim()} size="icon" className="h-10 w-10 shrink-0 rounded-xl">
              <IconSend className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 px-1">Press Enter to send, Shift+Enter for new line</p>
        </div>
      </CardContent>
    </Card>
  );

  const floatingButton = !pinned && (
    <Button
      size="icon"
      className="fixed bottom-6 right-6 z-50 rounded-full h-14 w-14 shadow-lg"
      onClick={() => setOpen(v => !v)}
    >
      <IconMessageChatbot />
    </Button>
  );

  const panelNode = (pinned || open) && panel;

  return (
    <>
      {floatingButton}
      {pinned && portalContainerRef.current
        ? createPortal(panelNode, portalContainerRef.current)
        : panelNode}
    </>
  );
}

export default Chatbot;
