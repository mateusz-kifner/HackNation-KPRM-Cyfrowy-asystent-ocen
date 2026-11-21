import { createFileRoute } from '@tanstack/react-router'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'

export const Route = createFileRoute('/panel-oceniajacego')({
  component: PanelOceniajacegoPage,
})

function PanelOceniajacegoPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <main className="flex-1 p-6">
            <h1 className="text-3xl font-bold">Panel Oceniającego</h1>
            <p className="mt-4 text-muted-foreground">Witaj w panelu oceniającego.</p>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
