/** This example was adapted from shadcn https://ui.shadcn.com/docs/, License in file ./License.ui.shadcn.com */
/** biome-ignore-all lint/correctness/useUniqueElementIds: this is test */

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function TestCard() {
  return (
    <Card className="flex gap-4 p-4">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>
          {/** biome-ignore lint/performance/noImgElement: this is test */}
          <img src="/placeholder.png" alt="test" className="bg-blue-200" />
        </CardContent>
        <CardFooter className="justify-end">
          <Button>Test</Button>
        </CardFooter>
      </Card>
      <Card className="w-96">
        <CardHeader>
          <CardTitle>Create project</CardTitle>
          <CardDescription>Deploy your new project in one-click.</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name1">Name</Label>
                <Input id="name1" placeholder="Name of your project" />
                <Input id="name2" placeholder="Name of your project" />
                <Input id="name3" placeholder="Name of your project" />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Cancel</Button>
          <Button>Deploy</Button>
        </CardFooter>
      </Card>
    </Card>
  );
}

export default TestCard;
