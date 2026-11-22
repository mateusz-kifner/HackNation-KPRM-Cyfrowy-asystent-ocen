import type { ToolDefinition } from "@/components/chatbot/chatbot-types";

export const navigateToPageTool: ToolDefinition = {
  type: "function",
  function: {
    name: "navigate_to_page",
    description: "Navigate to a page in the app.",
    parameters: {
      type: "object",
      properties: {
        path: {
          type: "string",
          enum: ["/", "/me"],
          description: "The app page path to open.",
        },
      },
      required: ["path"],
    },
  },
};

export type AppPagePath = "/" | "/me";

export function createNavigateToPageHandler(
  navigate: (path: AppPagePath) => Promise<void> | void,
) {
  return async ({ path }: Record<string, unknown>) => {
    if (path !== "/" && path !== "/me") {
      return { error: "Unsupported page. Available pages are / and /me." };
    }

    await navigate(path);
    return { success: true, path };
  };
}
