/** This example was adapted from shadcn https://ui.shadcn.com/docs/, License in file ./License.ui.shadcn.com */
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

function TestNativeSelect() {
  return (
    <>
      <div className="flex flex-col gap-4">
        <NativeSelect>
          <NativeSelectOption value="apple">Apple</NativeSelectOption>
          <NativeSelectOption value="banana">Banana</NativeSelectOption>
          <NativeSelectOption value="blueberry">Blueberry</NativeSelectOption>
          <NativeSelectOption value="grapes">Grapes</NativeSelectOption>
          <NativeSelectOption value="pineapple">Pineapple</NativeSelectOption>
        </NativeSelect>

        <NativeSelect size="sm">
          <NativeSelectOption value="est">Eastern Standard Time (EST)</NativeSelectOption>
          <NativeSelectOption value="cst">Central Standard Time (CST)</NativeSelectOption>
          <NativeSelectOption value="mst">Mountain Standard Time (MST)</NativeSelectOption>
          <NativeSelectOption value="pst">Pacific Standard Time (PST)</NativeSelectOption>
        </NativeSelect>

        <NativeSelect disabled>
          <NativeSelectOption value="disabled">Disabled Select</NativeSelectOption>
        </NativeSelect>
      </div>
    </>
  );
}

export default TestNativeSelect;
