import { IconClipboardCheck, IconShield, IconUsers } from '@tabler/icons-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const accessLevels = [
  {
    role: 'Employee',
    icon: IconClipboardCheck,
    description:
      'Work on your assigned evaluations, review your assessment history, and manage your profile.',
  },
  {
    role: 'Manager',
    icon: IconUsers,
    description:
      'Everything employees can do, plus access the employee directory and manage evaluation work for your team.',
  },
  {
    role: 'Admin',
    icon: IconShield,
    description:
      'Full access to evaluation administration, user accounts, and administrative corrections.',
  },
]

export function RoleAccessOverview() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 pb-12 sm:px-10">
      <div className="mb-5 space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">Access by role</h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Your account role determines which tools and information are available.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {accessLevels.map(({ role, icon: Icon, description }) => (
          <Card key={role} className="bg-card/70 ring-1 ring-border/70">
            <CardHeader className="gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <CardTitle className="text-base">{role}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="leading-relaxed">
                {description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
