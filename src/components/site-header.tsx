import { Link, useMatchRoute } from '@tanstack/react-router'
import { Button } from "#/components/ui/button.tsx"
import { Separator } from "#/components/ui/separator.tsx"
import { SidebarTrigger } from "#/components/ui/sidebar.tsx"
import { IconUsers, IconShieldCheck, IconDashboard } from "@tabler/icons-react"
import { cn } from '@/lib/utils'

export function SiteHeader() {
  const matchRoute = useMatchRoute()
  const isActive = (path: string) => !!matchRoute({ to: path })

  const navItems = [
    {
      title: 'Panel Pracowniczy',
      to: '/panel-pracowniczy',
      icon: IconUsers,
    },
    {
      title: 'Panel Oceniającego',
      to: '/panel-oceniajacego',
      icon: IconShieldCheck,
    },
    {
      title: 'Admin',
      to: '/admin',
      icon: IconDashboard,
    },
  ]

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive(item.to) ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                )}
              >
                <Icon className="size-4" />
                {item.title}
              </Link>
            )
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <h1 className="text-base font-medium">Documents</h1>
        </div>
      </div>
    </header>
  )
}
