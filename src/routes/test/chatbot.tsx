import { createFileRoute } from "@tanstack/react-router";
import { lorem } from "#/components/ui-test/lorem";

export const Route = createFileRoute("/test/chatbot")({
	component: ChatbotTest,
});

function ChatbotTest() {
	return (
		<div className="relative min-h-screen flex gap-4">
			<div className="container mx-auto py-8 flex flex-col gap-4">
				<h1 className="text-2xl font-bold mb-4">Chatbot Test</h1>
				<p className="text-muted-foreground">
					Chatbot widget is fixed at bottom right. Try sending a message asking
					for current date/time.
				</p>
				<div>{lorem}</div>
				<div>{lorem}</div>
				<div>{lorem}</div>
				<div>{lorem}</div>
				<div>{lorem}</div>
				<div>{lorem}</div>
				<div>{lorem}</div>
				<div>{lorem}</div>
			</div>
		</div>
	);
}
