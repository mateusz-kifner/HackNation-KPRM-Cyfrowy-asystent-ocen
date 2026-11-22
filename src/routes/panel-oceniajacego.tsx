import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/panel-oceniajacego')({
  component: PanelOceniajacegoPage,
})

function PanelOceniajacegoPage() {
  return (
    <main className="flex-1 p-6">
      <h1 className="text-3xl font-bold">Panel Oceniającego</h1>
      <p className="mt-4 text-muted-foreground">Witaj w panelu oceniającego.</p>
    </main>
  )
}
