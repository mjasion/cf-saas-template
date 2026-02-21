// API client that uses service binding to call backend worker
// This runs on the server (in the frontend worker) and calls the backend worker directly

import { forwardCookies } from './cookie-forward'

/** Base URL for service binding calls (hostname is ignored, only path matters) */
export const API_INTERNAL_BASE = 'http://api.internal'

export interface ApiClientOptions {
  env: { API: Fetcher }
  headers?: Record<string, string>
}

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  status: number
}

/**
 * Creates an API client that uses Cloudflare service binding
 * to call the backend worker directly (no HTTP round-trip)
 */
export function createApiClient(options: ApiClientOptions) {
  const { env, headers: defaultHeaders = {} } = options

  async function request<T = unknown>(
    method: string,
    path: string,
    options: {
      body?: unknown
      headers?: Record<string, string>
    } = {}
  ): Promise<ApiResponse<T>> {
    const url = new URL(path, API_INTERNAL_BASE)

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
      ...options.headers,
    }

    const init: RequestInit = {
      method,
      headers: requestHeaders,
    }

    if (options.body && method !== 'GET') {
      init.body = JSON.stringify(options.body)
    }

    try {
      const response = await env.API.fetch(url.toString(), init)

      // Forward any Set-Cookie headers from backend to browser
      await forwardCookies(response)

      const contentType = response.headers.get('content-type')
      let data: T | undefined

      if (contentType?.includes('application/json')) {
        data = (await response.json()) as T
      }

      if (!response.ok) {
        return {
          error: (data as any)?.error || (data as any)?.message || 'Request failed',
          status: response.status,
        }
      }

      return {
        data,
        status: response.status,
      }
    } catch (error) {
      console.error('API request failed:', error)
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 500,
      }
    }
  }

  return {
    request,
  }
}

export type ApiClient = ReturnType<typeof createApiClient>

/** Auth cookie helpers */
export const ACCESS_COOKIE_NAME = 'app-access-token'

export function getSessionIdFromRequest(request: Request): string | null {
  const cookies = request.headers.get('Cookie')
  if (!cookies) return null

  const match = cookies.match(
    new RegExp(`(?:^|; )${ACCESS_COOKIE_NAME}=([^;]+)`)
  )
  return match ? match[1] : null
}
