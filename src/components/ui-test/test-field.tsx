/** This example was adapted from shadcn https://ui.shadcn.com/docs/, License in file ./License.ui.shadcn.com */
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

function TestField() {
  return (
    <div className="w-full max-w-md">
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Profile</FieldLegend>
          <FieldDescription>This appears on invoices and emails.</FieldDescription>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Full name</FieldLabel>
              <Input id="name" autoComplete="off" placeholder="Evil Rabbit" />
              <FieldDescription>This appears on invoices and emails.</FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input id="username" autoComplete="off" aria-invalid />
              <FieldDescription>Choose another username.</FieldDescription>
            </Field>
            <Field orientation="horizontal">
              <Checkbox id="newsletter" />
              <FieldLabel htmlFor="newsletter">Subscribe to the newsletter</FieldLabel>
            </Field>
          </FieldGroup>
        </FieldSet>
        <FieldSeparator />
        <FieldSet>
          <FieldLegend variant="label">Preferences</FieldLegend>
          <FieldGroup>
            <Field orientation="horizontal">
              <FieldLabel htmlFor="theme">Dark mode</FieldLabel>
              <Input id="theme" type="text" placeholder="auto" />
            </Field>
          </FieldGroup>
        </FieldSet>
      </FieldGroup>
    </div>
  );
}

export default TestField;
