import { useLocalStorage } from "@mantine/hooks";

function useChatPinState(defaultValue?:boolean ) {
  const state= useLocalStorage({
    key: 'chat-pinned',
    defaultValue: defaultValue ?? false,
  });
  return state
}

export default useChatPinState
