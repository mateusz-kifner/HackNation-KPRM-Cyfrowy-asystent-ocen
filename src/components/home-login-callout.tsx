import { IconArrowUpRight } from '@tabler/icons-react'
import { authClient } from '#/lib/auth-client'

export function HomeLoginCallout() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending || session?.user) return null

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed right-12 top-12 z-[9999] text-sm font-semibold text-primary drop-shadow-sm sm:right-16"
    >
      <IconArrowUpRight aria-hidden="true" className="absolute -top-1 right-0 size-9" stroke={2.5} />
      <span className="absolute right-10 top-6 whitespace-nowrap">Start here</span>
    </div>
  )
}
