import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ErrorBoundary } from "react-error-boundary";
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
} from "#/components/ui/code-block";
// import { useHighlightedCode } from "#/hooks/use-highlighted-code";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";

export const Route = createFileRoute("/test/shadcn")({
  component: ShadcnDemo,
});

const modules = import.meta.glob("../../components/ui-test/test-*.tsx", { eager: false });
const modulesRaw = import.meta.glob("../../components/ui-test/test-*.tsx", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

type Override = { className?: string; description?: string };

const overrides: Record<string, Override> = {
  Alert: { className: "flex-col" },
  Button: { className: "flex-col" },
  Checkbox: { className: "flex-col" },
  Collapsible: { className: "flex-col" },
  DropdownMenu: { className: "justify-center" },
  HoverCard: { className: "justify-center" },
  InputOTP: { className: "flex-col" },
  Input: { className: "flex-col" },
  Label: { className: "flex-col" },
  Select: { className: "flex-col" },
  Skeleton: { className: "flex-col" },
  Slider: { className: "flex-col gap-7 pb-7" },
  Tabs: { className: "justify-center" },
  TextArea: { className: "flex-col" },
  Toggle: { className: "flex-col" },
  Tooltip: { className: "flex-col" },
  Carousel: { className: "justify-center" },
  AspectRatio: { description: "16 / 9" },
};

const UIElements = Object.entries(modules).map(([path, importer]) => {
  const match = path.match(/test-(.+)\.tsx$/);
  const raw = match?.[1] ?? "unknown";
  const title = raw
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  const Element = lazy(() => importer() as Promise<any>);
  const override = overrides[title] ?? {};
  const source = modulesRaw[path] ?? "";
  return { title, Element, source, ...override };
});

function CodePreview({ source, fileName }: { source: string; fileName: string }) {
  // const lines = useHighlightedCode(source, "tsx");
	const 	lines = ["test"];
  return (
    <CodeBlock>
      <CodeBlockHeader>
        <CodeBlockTitle>{fileName}</CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton value={source} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent lineNumbers>
        {lines.map((line, i) => (
          <CodeBlockLine key={i}>{line}</CodeBlockLine>
        ))}
      </CodeBlockContent>
    </CodeBlock>
  );
}

function ShadcnDemo() {
  return (
    <div className="mx-auto flex max-w-screen-xl flex-col gap-4 p-2 pb-96">
      {UIElements.map((val, index) => {
        const fileName = `src/components/ui-test/test-${val.title.toLowerCase().replace(/\s+/g, "-")}.tsx`;
        return (
          <Card key={`${val.title}-${index}`}>
            <Tabs defaultValue="preview" className="w-full">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <CardTitle>{val.title}</CardTitle>
                  {val.description && <CardDescription>{val.description}</CardDescription>}
                </div>
                <TabsList>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="code">Code</TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent className="p-0">
                <TabsContent value="preview">
                  <div className={cn("flex gap-2 p-2", val.className)}>
                    <ErrorBoundary
                      fallbackRender={(props) => (
                        <div>Error: {JSON.stringify(props.error, null, 2) ?? ""}</div>
                      )}
                    >
                      <Suspense fallback={null}>
                        <val.Element />
                      </Suspense>
                    </ErrorBoundary>
                  </div>
                </TabsContent>
                <TabsContent value="code">
                  <CodePreview source={val.source} fileName={fileName} />
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        );
      })}
    </div>
  );
}
