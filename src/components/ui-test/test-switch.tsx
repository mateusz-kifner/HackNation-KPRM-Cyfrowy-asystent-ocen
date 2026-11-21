/** This example was adapted from shadcn https://ui.shadcn.com/docs/, License in file ./License.ui.shadcn.com */
/** biome-ignore-all lint/correctness/useUniqueElementIds: this is test */
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

function TestSwitch() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        <Switch id="airplane-mode" />
        <Label htmlFor="airplane-mode">Airplane Mode</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="color-mode" />
        <Label htmlFor="color-mode">Airplane Mode</Label>
      </div>
    </div>
  );
}

export default TestSwitch;
