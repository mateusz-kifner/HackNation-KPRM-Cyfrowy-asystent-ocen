/** This example was adapted from shadcn https://ui.shadcn.com/docs/, License in file ./License.ui.shadcn.com */
import { IconFilePencil, IconSearch, IconTerminal } from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import {
  Trace,
  TraceIcon,
  TraceLine,
  TraceTitle,
  TraceDescription,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
} from "@/components/ui/trace";

function TestTrace() {
  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4">
        <div>
          <h4 className="mb-2 text-sm font-medium">Static</h4>
          <Trace className="max-w-sm">
            <TraceLine>
              <TraceIcon>
                <IconSearch />
              </TraceIcon>
              <TraceTitle>Searched for minimumReleaseAge</TraceTitle>
            </TraceLine>
            <TraceLine>
              <TraceIcon>
                <IconFilePencil />
              </TraceIcon>
              <TraceTitle>Read pnpm-workspace.yaml</TraceTitle>
            </TraceLine>
            <TraceLine>
              <TraceIcon>
                <IconTerminal />
              </TraceIcon>
              <TraceTitle>Ran pnpm install</TraceTitle>
            </TraceLine>
          </Trace>
        </div>
        <div>
          <h4 className="mb-2 text-sm font-medium">With description</h4>
          <Trace className="max-w-sm">
            <TraceLine>
              <TraceIcon>
                <IconFilePencil />
              </TraceIcon>
              <TraceTitle>Edited components/settings/form.tsx</TraceTitle>
              <TraceDescription className="font-mono">+48 -12</TraceDescription>
            </TraceLine>
            <TraceLine>
              <TraceIcon>
                <IconTerminal />
              </TraceIcon>
              <TraceTitle>Ran pnpm test</TraceTitle>
              <TraceDescription>14s</TraceDescription>
            </TraceLine>
          </Trace>
        </div>
        <div>
          <h4 className="mb-2 text-sm font-medium">Collapsible</h4>
          <Trace className="max-w-sm">
            <TraceCollapsible>
              <TraceCollapsibleTrigger>
                <TraceLine>
                  <TraceIcon>
                    <IconTerminal />
                  </TraceIcon>
                  <TraceTitle>Ran node --version</TraceTitle>
                </TraceLine>
              </TraceCollapsibleTrigger>
              <TraceCollapsibleContent>
                <pre className="mt-2 rounded bg-muted p-2 font-mono text-xs">v24.18.0</pre>
              </TraceCollapsibleContent>
            </TraceCollapsible>
          </Trace>
        </div>
      </div>
    </Card>
  );
}

export default TestTrace;
