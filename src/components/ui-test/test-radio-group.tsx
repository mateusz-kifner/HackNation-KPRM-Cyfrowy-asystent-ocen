/** This example was adapted from shadcn https://ui.shadcn.com/docs/, License in file ./License.ui.shadcn.com */
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

function TestRadioGroup() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4">
        <Label>Select your preferred contact method</Label>
        <RadioGroup defaultValue="email" className="grid grid-cols-1 gap-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="email" id="email" />
            <Label htmlFor="email">Email</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="phone" id="phone" />
            <Label htmlFor="phone">Phone</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="sms" id="sms" />
            <Label htmlFor="sms">SMS</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="grid gap-4">
        <Label>Choose a plan</Label>
        <RadioGroup defaultValue="pro" className="grid grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="free" id="free" />
            <Label htmlFor="free">Free</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pro" id="pro" />
            <Label htmlFor="pro">Pro</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="enterprise" id="enterprise" />
            <Label htmlFor="enterprise">Enterprise</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}

export default TestRadioGroup;
