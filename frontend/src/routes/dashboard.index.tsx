import { createFileRoute } from '@tanstack/react-router'
import { Zap, Users, Activity, TrendingUp, BookOpen } from 'lucide-react'
import { BentoGrid, BentoCard } from '@/components/bento'

export const Route = createFileRoute('/dashboard/')({ component: DashboardHome })

function DashboardHome() {
  const { user } = Route.useRouteContext()
  const username = user.email.split('@')[0]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, {username}.</p>
      </div>

      <BentoGrid columns={4}>
        {/* Welcome card - wide */}
        <BentoCard colSpan={2} index={0} className="bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/20">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Welcome to your SaaS</h2>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                This is your dashboard. Start building your product by customizing these cards,
                adding new routes, and connecting to your API.
              </p>
            </div>
          </div>
        </BentoCard>

        {/* Stat cards */}
        <BentoCard index={1} interactive>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">Total Users</p>
            </div>
          </div>
        </BentoCard>

        <BentoCard index={2} interactive>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-500/10">
              <Activity className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">Active Now</p>
            </div>
          </div>
        </BentoCard>

        <BentoCard index={3} interactive>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10">
              <TrendingUp className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">--</p>
              <p className="text-xs text-muted-foreground">Revenue</p>
            </div>
          </div>
        </BentoCard>

        {/* Getting Started card */}
        <BentoCard colSpan={2} index={4}>
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
              <BookOpen className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <h3 className="font-semibold">Getting Started</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Authentication is working
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                  Add your first API endpoint
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                  Customize the dashboard
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                  Deploy to production
                </li>
              </ul>
            </div>
          </div>
        </BentoCard>
      </BentoGrid>
    </div>
  )
}
