import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/manager')({
  component: ManagerPage,
})

function ManagerPage() {
  return null
}
