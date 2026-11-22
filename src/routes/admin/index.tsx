import { createFileRoute } from '@tanstack/react-router'
import { SectionCards } from '@/components/section-cards'
import { ChartAreaInteractive } from '@/components/chart-area-interactive'
import { DataTable } from '@/components/data-table'
import dashboardData from '@/data/dashboard.json'

export const Route = createFileRoute('/admin/')({
  component: AdminPage,
})

function AdminPage() {
  return (
    <main className="flex-1 p-6 space-y-6">
      <SectionCards />
      <ChartAreaInteractive />
      <DataTable data={dashboardData} />
    </main>
  )
}
