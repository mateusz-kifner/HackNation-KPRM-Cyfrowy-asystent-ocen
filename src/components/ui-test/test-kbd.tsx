/** This example was adapted from shadcn https://ui.shadcn.com/docs/, License in file ./License.ui.shadcn.com */
import { Kbd, KbdGroup } from "@/components/ui/kbd";

function TestKbd() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span>Press</span>
        <Kbd>Ctrl</Kbd>
        <span>+</span>
        <Kbd>C</Kbd>
        <span>to copy</span>
      </div>
      <KbdGroup>
        <Kbd>Shift</Kbd>
        <Kbd>Alt</Kbd>
        <Kbd>Enter</Kbd>
      </KbdGroup>
    </div>
  );
}

export default TestKbd;
