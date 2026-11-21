/** This example was adapted from shadcn https://ui.shadcn.com/docs/, License in file ./License.ui.shadcn.com */
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
} from "@/components/ui/code-block";
import { Card } from "@/components/ui/card";
import { useHighlightedCode } from "@/hooks/use-highlighted-code";

const code = `import { streamText } from "ai"

export async function POST(request: Request) {
  const { messages } = await request.json()

  const result = streamText({
    model: "anthropic/claude-sonnet-4.5",
    system: "You are a helpful assistant. Answer in one short paragraph.",
    messages,
  })

  return result.toUIMessageStreamResponse()
}`;

function TestCodeBlock() {
  const lines = useHighlightedCode(code, "ts");

  return (
    <Card className="w-full p-2">
      <CodeBlock>
        <CodeBlockHeader>
          <CodeBlockTitle>app/api/chat/route.ts</CodeBlockTitle>
          <CodeBlockActions>
            <CodeBlockCopyButton value={code} />
          </CodeBlockActions>
        </CodeBlockHeader>
        <CodeBlockContent lineNumbers>
          {lines.map((line, index) => (
            <CodeBlockLine key={index}>{line}</CodeBlockLine>
          ))}
        </CodeBlockContent>
      </CodeBlock>
    </Card>
  );
}

export default TestCodeBlock;
