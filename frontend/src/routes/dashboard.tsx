import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { getServerSession } from '@/lib/auth-session'
import { AppSidebar } from '@/components/app-sidebar'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'

interface DashboardContext {
  user: { email: string }
}

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async ({ location }) => {
    const session = await getServerSession()

    if (!session) {
      throw redirect({
        to: '/login',
        search: {
          redirectTo: location.pathname,
        },
      })
    }

    return {
      user: session.user,
    } as DashboardContext
  },
  component: DashboardLayout,
  head: () => ({
    meta: [
      { title: 'Dashboard - SaaS Template' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
})

function DashboardLayout() {
  const { user } = Route.useRouteContext()

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <span className="text-sm text-muted-foreground">Dashboard</span>
        </header>
        <div className="flex-1 p-4 sm:p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
