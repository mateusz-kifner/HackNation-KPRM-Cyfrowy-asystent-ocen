/** This example was adapted from shadcn https://ui.shadcn.com/docs/, License in file ./License.ui.shadcn.com */
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useState } from "react";

function TestSidebar() {
  const [show, setShow] = useState(false);

  if (!show) {
    return (
      <div className="w-full max-h-[500px] overflow-auto border rounded-lg p-4">
        <Button onClick={() => setShow(true)}>Open Sidebar</Button>
      </div>
    );
  }

  return (
    <div className="w-full max-h-[500px] overflow-auto border rounded-lg">
      <SidebarProvider>
        <div className="flex h-[400px] w-full">
          <Sidebar>
            <SidebarHeader>
              <div className="p-2">
                <span className="font-medium">Sidebar</span>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton>Dashboard</SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>Messages</SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>Settings</SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
              <SidebarSeparator />
              <SidebarGroup>
                <SidebarGroupLabel>Tools</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton>Analytics</SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>Reports</SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>Sign out</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShow(false)}
                    className="w-full"
                  >
                    Close
                  </Button>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>
          <div className="flex flex-1 flex-col">
            <header className="flex items-center justify-between p-4 border-b">
              <span>Main content</span>
              <SidebarInput placeholder="Search..." />
            </header>
            <main className="flex-1 p-4 overflow-auto">
              <p>Sidebar is now visible. Click Close at the bottom of the sidebar to hide it.</p>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}

export default TestSidebar;
