/** This example was adapted from shadcn https://ui.shadcn.com/docs/, License in file ./License.ui.shadcn.com */
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { IconFolder } from "@tabler/icons-react";

function TestItem() {
  return (
    <div className="w-full max-w-md">
      <Item variant="outline">
        <ItemMedia variant="icon">
          <IconFolder />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Project Files</ItemTitle>
          <ItemDescription>Contains source code, assets, and configuration files.</ItemDescription>
        </ItemContent>
      </Item>
      <Item className="mt-4" size="sm">
        <ItemMedia variant="default">
          <div className="h-8 w-8 rounded bg-muted" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Settings</ItemTitle>
          <ItemDescription>Manage your preferences and account details.</ItemDescription>
        </ItemContent>
      </Item>
    </div>
  );
}

export default TestItem;
