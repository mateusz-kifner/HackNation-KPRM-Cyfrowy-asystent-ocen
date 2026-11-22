import { LoginForm } from "@/components/login-form"
import { authClient } from '#/lib/auth-client'
import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

export function LoginPage() {
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()

  useEffect(() => {
    if (session?.user) {
      navigate({ to: '/' })
    }
  }, [session?.user, navigate])

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <img src="/logo.png" alt="Blue Void logo" className="size-10" />
          <span className="font-mono text-2xl">BlueVoid</span>
        </a>
        <LoginForm />
      </div>
    </div>
  )
}
