/** This example was adapted from shadcn https://ui.shadcn.com/docs/, License in file ./License.ui.shadcn.com */
import { IconBold, IconItalic, IconUnderline } from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

function TestToggleGroup() {
  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4">
        <div>
          <h4 className="mb-2 text-sm font-medium">Multiple</h4>
          <ToggleGroup variant="outline" type="multiple">
            <ToggleGroupItem value="bold" aria-label="Toggle bold">
              <IconBold />
            </ToggleGroupItem>
            <ToggleGroupItem value="italic" aria-label="Toggle italic">
              <IconItalic />
            </ToggleGroupItem>
            <ToggleGroupItem value="underline" aria-label="Toggle underline">
              <IconUnderline />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div>
          <h4 className="mb-2 text-sm font-medium">Single</h4>
          <ToggleGroup variant="outline" type="single" defaultValue="a">
            <ToggleGroupItem value="a" aria-label="A">
              A
            </ToggleGroupItem>
            <ToggleGroupItem value="b" aria-label="B">
              B
            </ToggleGroupItem>
            <ToggleGroupItem value="c" aria-label="C">
              C
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div>
          <h4 className="mb-2 text-sm font-medium">Sizes</h4>
          <div className="flex flex-col gap-2">
            <ToggleGroup type="single" size="sm" defaultValue="sm" variant="outline">
              <ToggleGroupItem value="sm" aria-label="Small">
                Small
              </ToggleGroupItem>
              <ToggleGroupItem value="md" aria-label="Medium">
                Medium
              </ToggleGroupItem>
            </ToggleGroup>
            <ToggleGroup type="single" defaultValue="lg" variant="outline">
              <ToggleGroupItem value="lg" aria-label="Large">
                Large
              </ToggleGroupItem>
              <ToggleGroupItem value="xl" aria-label="XL">
                XL
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default TestToggleGroup;
