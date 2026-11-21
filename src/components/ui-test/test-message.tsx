/** This example was adapted from shadcn https://ui.shadcn.com/docs/, License in file ./License.ui.shadcn.com */
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from "@/components/ui/message";

function TestMessage() {
  return (
    <MessageGroup>
      <Message>
        <MessageAvatar>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            A
          </div>
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>Alex</MessageHeader>
          <div className="rounded-lg bg-muted p-3">Hello! How are you today?</div>
          <MessageFooter>10:00 AM</MessageFooter>
        </MessageContent>
      </Message>

      <Message align="end">
        <MessageContent>
          <MessageHeader>You</MessageHeader>
          <div className="rounded-lg bg-primary text-primary-foreground p-3">
            I'm doing great, thanks! How about you?
          </div>
          <MessageFooter>10:01 AM</MessageFooter>
        </MessageContent>
      </Message>

      <Message>
        <MessageAvatar>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            A
          </div>
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>Alex</MessageHeader>
          <div className="rounded-lg bg-muted p-3">Pretty good. Want to grab coffee later?</div>
          <MessageFooter>10:02 AM</MessageFooter>
        </MessageContent>
      </Message>
    </MessageGroup>
  );
}

export default TestMessage;
