/** This example was adapted from shadcn https://ui.shadcn.com/docs/, License in file ./License.ui.shadcn.com */
/** biome-ignore-all lint/correctness/useUniqueElementIds: this is test */
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function TestLabel() {
  return (
    <>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="picture">Picture</Label>
        <Input id="picture" type="file" />
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="checkbox_unchecked" />
        <Label htmlFor="checkbox_unchecked">Unchecked</Label>
      </div>
    </>
  );
}

export default TestLabel;
