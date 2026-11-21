/** This example was adapted from shadcn https://ui.shadcn.com/docs/, License in file ./License.ui.shadcn.com */
import { DirectionProvider, useDirection } from "@/components/ui/direction";
import { Card } from "@/components/ui/card";

function DirectionDisplay() {
  const direction = useDirection();
  return <div>Current direction: {direction}</div>;
}

function TestDirection() {
  return (
    <Card className="w-full p-2">
      <div className="flex flex-col gap-4">
        <DirectionProvider dir="ltr">
          <div className="p-4">
            <p>LTR content</p>
            <DirectionDisplay />
          </div>
        </DirectionProvider>
        <DirectionProvider dir="rtl">
          <div className="p-4">
            <p>RTL content</p>
            <DirectionDisplay />
          </div>
        </DirectionProvider>
      </div>
    </Card>
  );
}

export default TestDirection;
