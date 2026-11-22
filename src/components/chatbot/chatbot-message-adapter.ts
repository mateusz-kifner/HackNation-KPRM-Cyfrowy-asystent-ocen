import type { UIMessage } from "@tanstack/ai-react";
import type { ChatMessage } from "./chatbot-types";

/** Flattens TanStack AI message parts into the rows used by the chatbot UI. */
export function toChatMessages(
	messages: ReadonlyArray<UIMessage>,
): ChatMessage[] {
	const rows: ChatMessage[] = [];

	for (const message of messages) {
		if (message.role === "system") continue;

		for (const [index, part] of message.parts.entries()) {
			if (part.type === "text" && part.content.trim()) {
				rows.push({
					id: `${message.id}-${index}`,
					role: message.role === "user" ? "user" : "assistant",
					content: part.content,
					timestamp: message.createdAt?.toISOString(),
				});
			} else if (part.type === "tool-result") {
				rows.push({
					id: `${message.id}-${index}`,
					role: "tool",
					name: part.name,
					content:
						typeof part.content === "string"
							? part.content
							: JSON.stringify(part.content),
					timestamp: part.createdAt?.toISOString(),
				});
			}
		}
	}

	return rows;
}
