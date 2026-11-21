import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FieldDescription } from "@/components/ui/field"
import { authClient } from '#/lib/auth-client'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnonymousSignIn = async () => {
    setLoading(true)
    setError(null)
    try {
      await authClient.signIn.anonymous()
      navigate({ to: '/' })
    } catch (e: any) {
      setError(e?.message ?? 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome</CardTitle>
          <CardDescription>
            Sign in without a password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleAnonymousSignIn}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Signing in...' : 'Continue as Guest'}
          </Button>
          {error && (
            <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
          )}
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
