"use client";
/** This example was adapted from shadcn https://ui.shadcn.com/docs/, License in file ./License.ui.shadcn.com */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function TestForm() {
  return (
    <form className="w-2/3 space-y-6">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input id="username" placeholder="shadcn" />
        <p className="text-sm text-muted-foreground">This is your public display name.</p>
      </div>
      <Button type="submit">Submit</Button>
    </form>
  );
}

export default TestForm;
