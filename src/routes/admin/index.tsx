import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/')({
  component: AdminPage,
})

function AdminPage() {
  return (
    <main className="flex-1 space-y-6">
      <h1>Admin dashboard</h1>
    </main>
  )
}
