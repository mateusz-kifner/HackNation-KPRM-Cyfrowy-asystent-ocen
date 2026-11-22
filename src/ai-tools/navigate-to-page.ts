import type { ToolDefinition } from "@/components/chatbot/chatbot-types";

export type AppPagePath = string;

export function createNavigateToPageTool(allowedPaths: readonly string[]) {
  return {
    type: "function",
    function: {
      name: "navigate_to_page",
      description: "Navigate to a page in the app.",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            enum: allowedPaths,
            description: "The app page path to open.",
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
) {
  return async ({ path }: Record<string, unknown>) => {
    if (typeof path !== "string" || !allowedPaths.includes(path)) {
      return { error: `Unsupported page. Available pages are ${allowedPaths.join(", ")}.` };
    }

    await navigate(path);
    return { success: true, path };
  };
}
