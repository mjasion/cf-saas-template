import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  type ErrorComponentProps,
  Link,
} from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'

import appCss from '../styles/global.css?url'
import { Button } from '@/components/ui/button'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'SaaS Template',
      },
      {
        name: 'description',
        content: 'A production-ready SaaS template powered by Cloudflare Workers, TanStack Start, and Hono.',
      },
      {
        name: 'theme-color',
        content: '#030520',
      },
      {
        name: 'color-scheme',
        content: 'dark light',
      },
      // Open Graph
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:site_name',
        content: 'SaaS Template',
      },
      // Twitter Card
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
    ],
    links: [
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous' as const,
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap',
      },
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
    scripts: [
      {
        // Inline script to prevent FOUC: apply cached theme CSS variables before paint
        children: `(function(){try{var m=localStorage.getItem('app-theme-mode')||'dark';var c=localStorage.getItem('app-theme-css');document.documentElement.setAttribute('data-theme',m);if(c){document.documentElement.setAttribute('style',c)}var l=localStorage.getItem('app-logo-config');if(l){document.documentElement.setAttribute('data-logo-config',l)}}catch(e){}})()`,
      },
    ],
  }),

  component: RootComponent,
  errorComponent: RootErrorComponent,
  notFoundComponent: NotFoundComponent,
})

function RootComponent() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background">
        <Outlet />
        <Toaster position="top-right" richColors />
        <Scripts />
      </body>
    </html>
  )
}

function RootErrorComponent({ error, reset }: ErrorComponentProps) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background">
        <div className="flex min-h-screen items-center justify-center px-6 py-12">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-8 inline-flex h-24 w-24 items-center justify-center rounded-full bg-red-500/10">
              <AlertTriangle className="h-12 w-12 text-red-400" />
            </div>

            <h1 className="mb-4 text-4xl font-bold">
              Something went wrong
            </h1>

            <p className="mb-8 text-xl text-muted-foreground">
              An unexpected error occurred. Please try again.
            </p>

            {error && (
              <div className="mb-8 rounded-xl bg-muted p-4 text-left">
                <p className="font-mono text-sm text-muted-foreground">
                  {error.message || 'Unknown error'}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button onClick={reset} size="lg">
                <RefreshCw className="mr-2 h-5 w-5" />
                Try again
              </Button>
              <Link to="/">
                <Button variant="outline" size="lg">
                  <Home className="mr-2 h-5 w-5" />
                  Go home
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <Toaster position="top-right" richColors />
        <Scripts />
      </body>
    </html>
  )
}

function NotFoundComponent() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background">
        <div className="flex min-h-screen items-center justify-center px-6 py-12">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-8">
              <h1 className="text-9xl font-bold text-primary">404</h1>
            </div>

            <h2 className="mb-4 text-4xl font-bold">
              Page not found
            </h2>

            <p className="mb-8 text-xl text-muted-foreground">
              The page you are looking for does not exist or has been moved.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link to="/">
                <Button size="lg">
                  <Home className="mr-2 h-5 w-5" />
                  Go home
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" size="lg">
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <Toaster position="top-right" richColors />
        <Scripts />
      </body>
    </html>
  )
}
