import { useRef } from "react";
import { IconPlayerStop, IconSend } from "@tabler/icons-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";

/**
 * Message draft. Submitting is delegated to the form so Enter behaves the same
 * whether it comes from a click or from the keyboard.
 */
export function ChatbotComposer({
  value,
  disabled,
  loading = false,
  placeholder = "Ask the agent...",
  onChange,
  onSubmit,
  onStop,
}: {
  value: string;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  onStop?: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const canSend = !disabled && value.trim().length > 0;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSend) {
      return;
    }
    onSubmit(value);
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="w-full">
      <InputGroup>
        <InputGroupTextarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-label="Message"
          className="min-h-14 max-h-48 overflow-y-auto"
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              formRef.current?.requestSubmit();
            }
          }}
        />
        <InputGroupAddon align="block-end" className="pt-1">
          <span className="text-[10px] text-muted-foreground">
            Press Enter to send, Shift+Enter for new line
          </span>
          {loading ? (
            <InputGroupButton
              type="button"
              variant="destructive"
              size="icon-sm"
              className="ml-auto rounded-full"
              onClick={onStop}
              aria-label="Stop generating response"
              title="Stop generating response"
            >
              <IconPlayerStop />
            </InputGroupButton>
          ) : (
            <InputGroupButton
              type="submit"
              variant="default"
              size="icon-sm"
              className="ml-auto rounded-full"
              disabled={!canSend}
              aria-label="Send message"
            >
              <IconSend />
            </InputGroupButton>
          )}
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}

export default ChatbotComposer;
