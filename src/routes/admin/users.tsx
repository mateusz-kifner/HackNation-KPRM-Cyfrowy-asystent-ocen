import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/users')({
  component: UsersPage,
})

function UsersPage() {
  return null
}
