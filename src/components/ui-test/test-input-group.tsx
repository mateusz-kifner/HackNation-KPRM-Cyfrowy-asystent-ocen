/** This example was adapted from shadcn https://ui.shadcn.com/docs/, License in file ./License.ui.shadcn.com */
import { IconSearch } from "@tabler/icons-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";

function TestInputGroup() {
  return (
    <>
      <InputGroup>
        <InputGroupAddon align="inline-start">
          <IconSearch />
        </InputGroupAddon>
        <InputGroupInput placeholder="Search..." />
        <InputGroupAddon align="inline-end">
          <Button variant="ghost" size="xs">
            Clear
          </Button>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup className="mt-4">
        <InputGroupAddon align="inline-start">https://</InputGroupAddon>
        <InputGroupInput placeholder="example.com" />
        <InputGroupAddon align="inline-end">
          <Button variant="outline" size="xs">
            Go
          </Button>
        </InputGroupAddon>
      </InputGroup>
    </>
  );
}

export default TestInputGroup;
