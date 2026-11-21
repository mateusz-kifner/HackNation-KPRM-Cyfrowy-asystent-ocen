/** This example was adapted from shadcn https://ui.shadcn.com/docs/, License in file ./License.ui.shadcn.com */
/** biome-ignore-all lint/correctness/useUniqueElementIds: this is test */
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function TestTextarea() {
  return (
    <>
      <Textarea placeholder="Type your message here." />
      <Textarea placeholder="Type your message here." disabled />
      <div className="grid w-full gap-1.5">
        <Label htmlFor="message-2">Your Message</Label>
        <Textarea placeholder="Type your message here." id="message-2" />
        <p className="text-muted-foreground text-sm">
          Your message will be copied to the support team.
        </p>
      </div>
    </>
  );
}

export default TestTextarea;
