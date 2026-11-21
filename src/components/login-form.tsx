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

const MOCK_USERS = [
  { name: 'Admin_admin', email: 'admin.admin@example.com', password: 'password123' },
  { name: 'Jan_Kowalski_Manager', email: 'jan.kowalski.manager@example.com', password: 'password123' },
  { name: 'Anna_Lewandowska_Emploee', email: 'anna.lewandowska.emploee@example.com', password: 'password123' },
  { name: 'Mateusz_Kifner_Emploee', email: 'mateusz.kifner.emploee@example.com', password: 'password123' },
]

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleMockSignIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      await authClient.signIn.email({ email, password })
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
            Sign in as a mock user
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {MOCK_USERS.map((user) => (
            <Button
              key={user.name}
              onClick={() => handleMockSignIn(user.email, user.password)}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Signing in...' : `Login as ${user.name}`}
            </Button>
          ))}
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
