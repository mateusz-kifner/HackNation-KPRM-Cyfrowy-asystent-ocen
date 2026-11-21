import {
  chat,
  chatParamsFromRequest,
  toServerSentEventsResponse,
} from "@tanstack/ai";
import { openaiCompatible } from "@tanstack/ai-openai/compatible";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: ({ request }) => POST(request),
    },
  },
})

const defaultModel = openaiCompatible({
  name: "default",
  baseURL: process.env.VITE_AI_URL!,
  apiKey: process.env.VITE_AI_API_KEY!,
  models: ["default"],
});


export async function POST(request: Request) {
  const { messages, threadId, runId } = await chatParamsFromRequest(request);

  const stream = chat({
			adapter: defaultModel("default"),
			messages,
			threadId,
			runId,
		});

  return toServerSentEventsResponse(stream);
}
