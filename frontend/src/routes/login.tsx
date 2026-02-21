import { useState } from 'react'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { AuthLayout } from '@/components/layout/auth-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const Route = createFileRoute('/login')({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: 'Sign in - SaaS Template' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
})

function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/a/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null) as { error?: string | { message?: string }; message?: string } | null
        const err = data?.error
        const msg = typeof err === 'string' ? err : err?.message ?? data?.message
        setError(msg || 'Invalid email or password.')
        return
      }

      toast.success('Logged in successfully.')
      router.navigate({ to: '/dashboard' })
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Welcome back" description="Sign in to your account to continue.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
