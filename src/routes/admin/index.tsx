import { createFileRoute } from '@tanstack/react-router'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { SectionCards } from '@/components/section-cards'
import { ChartAreaInteractive } from '@/components/chart-area-interactive'
import { DataTable } from '@/components/data-table'
import dashboardData from '@/data/dashboard.json'

export const Route = createFileRoute('/admin/')({
  component: AdminPage,
})

function AdminPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <main className="flex-1 p-6 space-y-6">
            <SectionCards />
            <ChartAreaInteractive />
            <DataTable data={dashboardData} />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
