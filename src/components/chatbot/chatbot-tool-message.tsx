import { IconTool } from "@tabler/icons-react";
import { Message, MessageContent } from "@/components/ui/message";
import {
	Trace,
	TraceCollapsible,
	TraceCollapsibleContent,
	TraceCollapsibleTrigger,
	TraceIcon,
	TraceLine,
	TraceTitle,
} from "@/components/ui/trace";
import type { ChatMessage } from "./chatbot-types";

/** A single tool result, shown as a trace line plus its raw payload. */
export function ChatbotToolMessage({ message }: { message: ChatMessage }) {
	return (
		<Message>
			<MessageContent className="gap-0">
				<Trace className="gap-0">
					<TraceCollapsible>
						<TraceCollapsibleTrigger>
							<TraceLine>
								<TraceIcon>
									<IconTool />
								</TraceIcon>
								<TraceTitle>Called {message.name ?? "a tool"}</TraceTitle>
							</TraceLine>
						</TraceCollapsibleTrigger>
						<TraceCollapsibleContent className="mt-1 mb-0 ml-1 pl-2">
							<pre className="max-w-full overflow-x-auto rounded-lg border bg-muted/40 px-2 py-1 font-mono text-xs wrap-break-word text-muted-foreground">
								{message.content}
							</pre>
						</TraceCollapsibleContent>
					</TraceCollapsible>
				</Trace>
			</MessageContent>
		</Message>
	);
}

export default ChatbotToolMessage;
