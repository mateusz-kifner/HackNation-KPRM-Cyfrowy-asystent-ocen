/** This example was adapted from shadcn https://ui.shadcn.com/docs/, License in file ./License.ui.shadcn.com */
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { Message, MessageAvatar, MessageContent, MessageHeader } from "@/components/ui/message";

function TestMessageScroller() {
  return (
    <MessageScroller>
      <MessageScrollerViewport>
        <MessageScrollerContent>
          {Array.from({ length: 20 }).map((_, i) => (
            <MessageScrollerItem key={i}>
              <Message align={i % 2 === 0 ? "start" : "end"}>
                {i % 2 === 0 && (
                  <MessageAvatar>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      {i}
                    </div>
                  </MessageAvatar>
                )}
                <MessageContent>
                  <MessageHeader>{i % 2 === 0 ? "User" : "You"}</MessageHeader>
                  <div className="rounded-lg bg-muted p-3">
                    This is message {i + 1} in the scroller. It demonstrates the message scroller
                    component with auto-scroll behavior.
                  </div>
                </MessageContent>
              </Message>
            </MessageScrollerItem>
          ))}
        </MessageScrollerContent>
      </MessageScrollerViewport>
      <MessageScrollerButton />
    </MessageScroller>
  );
}

export default TestMessageScroller;
