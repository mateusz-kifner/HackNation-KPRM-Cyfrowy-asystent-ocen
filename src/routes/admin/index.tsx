import { createFileRoute } from '@tanstack/react-router'
import { PageBreadcrumb } from '#/components/page-breadcrumb'

export const Route = createFileRoute('/admin/')({
  component: AdminPage,
})

function AdminPage() {
  return (
    <main className="flex-1 space-y-6">
      <PageBreadcrumb items={[{ label: 'Admin' }, { label: 'Dashboard' }]} />
    </main>
  )
}
