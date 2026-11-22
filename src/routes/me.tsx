import { createFileRoute } from '@tanstack/react-router'
import { AdminNavigation } from '@/components/admin/admin-navigation'

export const Route = createFileRoute('/me')({
  component: MePage,
})

function MePage() {
  return (
    <div className="flex min-h-full flex-col gap-5 p-4 sm:p-6 md:flex-row md:items-start md:gap-6">
      <AdminNavigation />
      <main className="min-w-0 flex-1">test string</main>
    </div>
  )
}
