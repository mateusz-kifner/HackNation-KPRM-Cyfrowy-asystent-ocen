import { IconCheck, IconCopy } from "@tabler/icons-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

/** Copies one transcript entry and briefly confirms the action. */
export function ChatbotCopyButton({ text }: { text: string }) {
	const [copied, setCopied] = useState(false);

	async function copyMessage() {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 1500);
		} catch {
			setCopied(false);
		}
	}

	return (
		<Button
			type="button"
			variant="ghost"
			size="icon-xs"
			className="text-muted-foreground opacity-0 transition-opacity group-hover/message:opacity-100 focus-visible:opacity-100"
			aria-label={copied ? "Message copied" : "Copy message text"}
			title={copied ? "Copied" : "Copy message text"}
			onClick={copyMessage}
		>
			{copied ? <IconCheck /> : <IconCopy />}
		</Button>
	);
}
