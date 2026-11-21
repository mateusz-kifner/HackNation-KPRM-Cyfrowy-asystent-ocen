import { AI_CONFIG } from "@/lib/ai-config";
import type {
  ApiMessage,
  ChatCompletionResponse,
  ChatRequest,
  NewChatMessage,
  ToolCall,
  ToolDefinition,
  ToolHandler,
} from "./chatbot-types";

const completionsUrl = () => `${AI_CONFIG.url}/chat/completions`;

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${AI_CONFIG.apiKey}`,
});

/** Strips UI-only fields before talking to the API. */
export function toApiMessages(messages: NewChatMessage[]): ApiMessage[] {
  return messages.map((message) => ({
    role: message.role,
    content: message.content,
    ...(message.toolCallId ? { tool_call_id: message.toolCallId } : {}),
    ...(message.toolCalls ? { tool_calls: message.toolCalls } : {}),
  }));
}

async function postCompletion(body: ChatRequest): Promise<ChatCompletionResponse> {
  const response = await fetch(completionsUrl(), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      model: AI_CONFIG.model,
      messages: body.messages,
      tools: body.tools?.length ? body.tools : undefined,
      tool_choice: body.toolChoice ?? "auto",
    }),
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status}`);
  }

  return (await response.json()) as ChatCompletionResponse;
}

function parseArguments(raw: string | undefined): Record<string, unknown> {
  try {
    return JSON.parse(raw ?? "{}") as Record<string, unknown>;
  } catch {
    return {};
  }
}

function describe(value: unknown): string {
  return typeof value === "string" ? value : JSON.stringify(value);
}

/**
 * Runs one turn: ask the model, execute every tool it asks for and ask again
 * with the results until the model has an answer. Messages are appended while
 * the turn progresses so the transcript can be observed.
 */
export async function runChatTurn({
  history,
  tools,
  handlers,
  onMessage,
}: {
  history: NewChatMessage[];
  tools: ToolDefinition[];
  handlers: Record<string, ToolHandler>;
  onMessage: (message: NewChatMessage) => void;
}): Promise<void> {
  const transcript: ApiMessage[] = toApiMessages(history);

  const response = await postCompletion({ messages: transcript, tools });
  const assistant = response.choices?.[0]?.message;

  if (!assistant) {
    throw new Error("Invalid response");
  }

  const content = assistant.content ?? "";
  const toolCalls = assistant.tool_calls ?? [];

  if (toolCalls.length === 0) {
    onMessage({ role: "assistant", content });
    return;
  }

  onMessage({ role: "assistant", content, toolCalls });
  transcript.push({ role: "assistant", content, tool_calls: toolCalls });

  for (const call of toolCalls) {
    const result = await runToolCall(call, handlers);
    const content = describe(result);

    onMessage({ role: "tool", content, name: call.function.name, toolCallId: call.id });
    transcript.push({ role: "tool", content, tool_call_id: call.id });
  }

  const followUp = await postCompletion({ messages: transcript, tools });
  const answer = followUp.choices?.[0]?.message?.content ?? "";

  onMessage({ role: "assistant", content: answer });
}

async function runToolCall(
  call: ToolCall,
  handlers: Record<string, ToolHandler>
): Promise<unknown> {
  const handler = handlers[call.function.name];
  const args = parseArguments(call.function.arguments);

  if (!handler) {
    return { error: `No handler registered for ${call.function.name}` };
  }

  try {
    return await handler(args);
  } catch (error) {
    return { error: String(error) };
  }
}
