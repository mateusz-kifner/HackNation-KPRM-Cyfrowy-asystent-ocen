import { IconBrain, IconLayoutDashboard, IconUsers } from '@tabler/icons-react'
import { Link, useRouterState } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const adminLinks = [
  { label: 'Dashboard', to: '/admin/', icon: IconLayoutDashboard },
  { label: 'Users', to: '/admin/users', icon: IconUsers },
  { label: 'AI settings', to: '/admin/ai-settings', icon: IconBrain },
] as const

export function AdminNavigation() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  return (
    <Card className="h-fit w-full shrink-0 shadow-lg shadow-black/5 md:sticky md:top-6 md:w-56">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Administration
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <nav aria-label="Admin navigation" className="flex gap-2 overflow-x-auto md:flex-col">
          {adminLinks.map(({ label, to, icon: Icon }) => {
            const active = pathname === to || (to !== '/admin/' && pathname.startsWith(to))
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  'inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </Link>
            )
          })}
        </nav>
      </CardContent>
    </Card>
  )
}
