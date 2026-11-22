import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Renders assistant-authored Markdown with GitHub-flavored tables and lists. */
export function ChatbotMarkdown({ content }: { content: string }) {
	return (
		<div className="prose prose-sm dark:prose-invert max-w-none break-words prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:border prose-pre:bg-muted/40 prose-pre:text-foreground prose-table:block prose-table:overflow-x-auto">
			<ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
		</div>
	);
}
