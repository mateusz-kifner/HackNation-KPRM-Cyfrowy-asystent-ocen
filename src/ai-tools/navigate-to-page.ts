import type { ToolDefinition } from "@/components/chatbot/chatbot-types";

export type AppPagePath = string;

export function createNavigateToPageTool(
  allowedPaths: readonly string[],
  allowedPathPrefixes: readonly string[] = [],
) {
  return {
    type: "function",
    function: {
      name: "navigate_to_page",
      description: `Navigate only when the user explicitly requests a page change. Exact destinations: ${allowedPaths.join(", ")}.${allowedPathPrefixes.length ? ` Dynamic destinations may use these prefixes followed by one ID segment: ${allowedPathPrefixes.join(", ")}.` : ""}`,
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            ...(allowedPathPrefixes.length === 0 ? { enum: allowedPaths } : {}),
            description: allowedPathPrefixes.length
              ? `Exact destination, or a destination beginning with ${allowedPathPrefixes.join(", ")} followed by a single ID segment.`
              : "The app page path to open.",
          },
        },
        required: ["path"],
      },
    },
  } as ToolDefinition;
}

export function createNavigateToPageHandler(
  allowedPaths: readonly string[],
  navigate: (path: string) => Promise<void> | void,
  allowedPathPrefixes: readonly string[] = [],
) {
  return async ({ path }: Record<string, unknown>) => {
    const isAllowedDynamicPath = typeof path === "string" && allowedPathPrefixes.some((prefix) =>
      path.startsWith(prefix) && /^[^/]+$/.test(path.slice(prefix.length)) && path.length > prefix.length,
    );
    if (typeof path !== "string" || (!allowedPaths.includes(path) && !isAllowedDynamicPath)) {
      return { error: `Unsupported page. Available pages are ${allowedPaths.join(", ")}.` };
    }

    await navigate(path);
    return { success: true, path };
  };
}
