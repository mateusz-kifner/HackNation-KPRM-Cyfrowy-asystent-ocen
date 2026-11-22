import { createFileRoute, Outlet } from '@tanstack/react-router'
import { AdminNavigation } from '@/components/admin/admin-navigation'

export const Route = createFileRoute('/admin')({ component: AdminLayout })

function AdminLayout() {
  return (
    <div className="flex min-h-full flex-col gap-5 p-4 sm:p-6 md:flex-row md:items-start md:gap-6">
      <AdminNavigation />
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  )
}
