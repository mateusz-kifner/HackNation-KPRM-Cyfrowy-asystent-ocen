import { IconMessageChatbot, IconPinned, IconPin, IconRotate, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { CardAction, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type HeaderButton = {
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
};

/** Title bar of the widget: identity on the left, window controls on the right. */
export function ChatbotHeader({
  title,
  pinned,
  onReset,
  onTogglePin,
  onClose,
}: {
  title: string;
  pinned: boolean;
  onReset: () => void;
  onTogglePin: () => void;
  onClose: () => void;
}) {
  const buttons: HeaderButton[] = [
    { label: "Reset conversation", onClick: onReset, icon: <IconRotate /> },
    {
      label: pinned ? "Unpin" : "Pin",
      onClick: onTogglePin,
      icon: pinned ? <IconPinned /> : <IconPin />,
    },
    { label: "Close", onClick: onClose, icon: <IconX /> },
  ];

  return (
    <CardHeader className="border-b bg-muted/40">
      <CardTitle className="flex items-center gap-2 text-base font-semibold">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <IconMessageChatbot className="size-4" />
        </span>
        <span className="truncate">{title}</span>
      </CardTitle>
      <CardAction className="flex items-center gap-1">
        {buttons.map((button) => (
          <Tooltip key={button.label}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={button.label}
                onClick={button.onClick}
              >
                {button.icon}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{button.label}</TooltipContent>
          </Tooltip>
        ))}
      </CardAction>
    </CardHeader>
  );
}

export default ChatbotHeader;
