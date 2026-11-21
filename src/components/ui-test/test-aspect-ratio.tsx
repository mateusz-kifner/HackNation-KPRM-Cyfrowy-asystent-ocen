/** This example was adapted from shadcn https://ui.shadcn.com/docs/, License in file ./License.ui.shadcn.com */
import { AspectRatio } from "@/components/ui/aspect-ratio";

function TestAspectRatio() {
  return (
    <div className="h-36 max-h-3xl min-h-36 w-36 min-w-36 max-w-3xl resize overflow-auto border border-red-500 border-solid">
      <AspectRatio ratio={16 / 9}>
        {/** biome-ignore lint/performance/noImgElement: this is test */}
        <img
          src="/placeholder.png"
          alt="test"
          className="h-full w-full rounded-md bg-red-200 object-cover"
        />
      </AspectRatio>
    </div>
  );
}

export default TestAspectRatio;
