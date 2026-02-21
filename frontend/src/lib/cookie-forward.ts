// Cookie forwarding utilities for SSR
// Separated to allow lazy imports and avoid TanStack Start virtual module resolution issues

/**
 * Forward Set-Cookie headers from backend response to browser.
 * This is needed because SSR calls go through the frontend worker,
 * and cookies set by the backend need to be forwarded to the client.
 */
export async function forwardCookies(backendResponse: Response): Promise<void> {
  try {
    const { getResponse } = await import('@tanstack/react-start/server')
    const outgoingResponse = getResponse()
    const setCookies = backendResponse.headers.getSetCookie()
    for (const cookieStr of setCookies) {
      outgoingResponse.headers.append('Set-Cookie', cookieStr)
    }
  } catch (error) {
    console.error('Failed to forward cookies:', error)
  }
}
