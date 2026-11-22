import {
	chat,
	chatParamsFromRequest,
	mergeAgentTools,
	toServerSentEventsResponse,
} from "@tanstack/ai";
import { openaiCompatible } from "@tanstack/ai-openai/compatible";
import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth";

export const Route = createFileRoute("/api/chat")({
	server: {
		handlers: {
			POST: ({ request }) => POST(request),
		},
	},
});

const defaultModel = openaiCompatible({
	name: "default",
	baseURL: process.env.VITE_AI_URL!,
	apiKey: process.env.VITE_AI_API_KEY!,
	models: ["default"],
});

export async function POST(request: Request) {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session || session.user.isAnonymous) {
		return new Response("Sign in is required to use chat.", { status: 401 });
	}

	const { messages, threadId, runId, tools, forwardedProps } =
		await chatParamsFromRequest(request);

	const stream = chat({
		adapter: defaultModel("default"),
		messages,
		threadId,
		runId,
		systemPrompts:
			typeof forwardedProps.systemPrompt === "string"
				? [forwardedProps.systemPrompt]
				: undefined,
		tools: mergeAgentTools([], tools),
	});

	return toServerSentEventsResponse(stream);
}
