/** This example was adapted from shadcn https://ui.shadcn.com/docs/, License in file ./License.ui.shadcn.com */
import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from "@/components/ui/bubble";
import { Card } from "@/components/ui/card";
import { lorem } from "./lorem";

function TestBubble() {
  return (
    <Card className="w-full p-2">
      <BubbleGroup>
        <Bubble variant="default" align="start">
          <BubbleContent>{lorem}</BubbleContent>
        </Bubble>
        <Bubble variant="secondary" align="end">
          <BubbleContent>Reply to message</BubbleContent>
        </Bubble>
        <Bubble variant="muted" align="start">
          <BubbleContent>{lorem}</BubbleContent>
          <BubbleReactions>
            <span>Like</span>
          </BubbleReactions>
        </Bubble>
      </BubbleGroup>
    </Card>
  );
}

export default TestBubble;
