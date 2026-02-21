// Server-side authentication utilities
// These functions run only on the server (in the frontend worker)
// and use the service binding to call the backend API

import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { forwardCookies } from './cookie-forward'
import { API_INTERNAL_BASE } from './api-client'

// Import env from cloudflare:workers - available at runtime in Workers
// @ts-ignore - cloudflare:workers is a runtime module
import { env } from 'cloudflare:workers'

export interface ServerUser {
  email: string
}

export interface SessionData {
  user: ServerUser
}

/**
 * Server function to validate the current session.
 * Forwards cookies to the backend API via service binding.
 * Returns user data if authenticated, null otherwise.
 */
export const getServerSession = createServerFn({ method: 'GET' }).handler(
  async (): Promise<SessionData | null> => {
    try {
      const request = getRequest()
      const cookie = request.headers.get('Cookie')

      if (!cookie) {
        return null
      }

      // Call backend /a/auth/validate-session via service binding
      const url = new URL('/a/auth/validate-session', API_INTERNAL_BASE)
      const response = await env.API.fetch(url.toString(), {
        headers: {
          Cookie: cookie,
        },
      })

      // Forward any Set-Cookie headers from backend to browser
      // This handles token refresh during SSR
      await forwardCookies(response)

      if (!response.ok) {
        return null
      }

      const data = (await response.json()) as SessionData
      return data
    } catch (error) {
      console.error('Failed to validate session:', error)
      return null
    }
  }
)
