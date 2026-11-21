/** This example was adapted from shadcn https://ui.shadcn.com/docs/, License in file ./License.ui.shadcn.com */
/** biome-ignore-all lint/correctness/useUniqueElementIds: this is test */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function TestInput() {
  return (
    <>
      <div>
        <Input type="email" placeholder="Email" />
      </div>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="picture">Picture</Label>
        <Input id="picture" type="file" />
      </div>
      <div>
        <Input disabled type="email" placeholder="Email" />
      </div>

      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input type="email" placeholder="Email" />
        <Button type="submit">Subscribe</Button>
      </div>
    </>
  );
}

export default TestInput;
