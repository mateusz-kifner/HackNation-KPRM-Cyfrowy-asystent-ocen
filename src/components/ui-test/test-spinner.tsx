/** This example was adapted from shadcn https://ui.shadcn.com/docs/, License in file ./License.ui.shadcn.com */
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

function TestSpinner() {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <Spinner />
          <span className="text-xs">Default</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Spinner className="size-6" />
          <span className="text-xs">Size 6</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Spinner className="size-8" />
          <span className="text-xs">Size 8</span>
        </div>
      </div>
    </Card>
  );
}

export default TestSpinner;
