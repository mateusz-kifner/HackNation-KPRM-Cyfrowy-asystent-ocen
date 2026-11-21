/** This example was adapted from shadcn https://ui.shadcn.com/docs/, License in file ./License.ui.shadcn.com */
import { Slider } from "@/components/ui/slider";

function TestSlider() {
  return (
    <>
      <Slider defaultValue={[50]} max={100} step={1} className={"w-[60%]"} />
      {/* Double slider with SliderThumb removed - SliderThumb export not available */}
      {/* <Slider defaultValue={[25, 75]} max={100} step={1} className={"w-[60%}"}>
        <SliderThumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
      </Slider> */}
      <Slider defaultValue={[50]} max={100} step={10} className={"w-[60%]"} />
    </>
  );
}

export default TestSlider;
