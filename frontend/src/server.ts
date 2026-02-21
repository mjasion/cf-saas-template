import handler from '@tanstack/react-start/server-entry'

export default {
  fetch(req: Request, env: unknown, ctx: unknown): Promise<Response> {
    return (handler as { fetch: (req: Request, env: unknown, ctx: unknown) => Promise<Response> }).fetch(req, env, ctx)
  },
}
