/** biome-ignore-all lint/correctness/useUniqueElementIds: this is test */
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

function TestCheckbox() {
  return (
    <>
      <div className="flex items-center gap-2">
        <Checkbox id="checkbox_unchecked" />
        <Label htmlFor="checkbox_unchecked">Unchecked</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="checkbox_checked" checked />
        <Label htmlFor="checkbox_checked">Checked</Label>
      </div>
    </>
  );
}

export default TestCheckbox;
