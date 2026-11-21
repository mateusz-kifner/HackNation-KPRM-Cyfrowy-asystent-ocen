/** This example was adapted from shadcn https://ui.shadcn.com/docs/, License in file ./License.ui.shadcn.com */
import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@/components/ui/button-group";
import { Card } from "@/components/ui/card";

function TestButtonGroup() {
  return (
    <Card className="w-full p-2">
      <div className="flex flex-col gap-4">
        <ButtonGroup>
          <Button variant="outline">Left</Button>
          <Button variant="outline">Center</Button>
          <Button variant="outline">Right</Button>
        </ButtonGroup>
        <ButtonGroup orientation="vertical">
          <Button variant="outline">Top</Button>
          <ButtonGroupSeparator />
          <Button variant="outline">Bottom</Button>
        </ButtonGroup>
        <ButtonGroup>
          <ButtonGroupText>Prefix</ButtonGroupText>
          <Button variant="outline">Action</Button>
          <ButtonGroupText>Suffix</ButtonGroupText>
        </ButtonGroup>
      </div>
    </Card>
  );
}

export default TestButtonGroup;
