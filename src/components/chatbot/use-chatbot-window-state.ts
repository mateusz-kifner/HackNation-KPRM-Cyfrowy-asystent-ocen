import { useLocalStorage } from "@mantine/hooks";

export type ChatbotWindowState = {
	x: number;
	y: number;
	width: number;
	height: number;
};

export const DEFAULT_CHATBOT_WINDOW_STATE: ChatbotWindowState = {
	x: 0,
	y: 0,
	width: 420,
	height: 640,
};

/** Persists the floating chatbot's viewport offset and dimensions. */
export function useChatbotWindowState() {
	return useLocalStorage<ChatbotWindowState>({
		key: "chatbot-window-state",
		defaultValue: DEFAULT_CHATBOT_WINDOW_STATE,
		getInitialValueInEffect: true,
	});
}
