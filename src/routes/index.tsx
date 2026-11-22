import { createFileRoute } from '@tanstack/react-router'
import { HomeIntroduction } from '@/components/home-introduction'
import { HomeLoginCallout } from '@/components/home-login-callout'
import { RoleAccessOverview } from '@/components/role-access-overview'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <div className="pb-12">
      <HomeLoginCallout />
      <HomeIntroduction />
      <RoleAccessOverview />
    </div>
  )
}
