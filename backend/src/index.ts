import { Hono } from "hono";
import { cors } from "hono/cors";
import { errorHandler } from "./middleware/error-handler.js";
import authRoutes from "./routes/auth.js";

// Cloudflare Worker bindings type
export type Bindings = {
  DB: D1Database;
  SESSIONS: KVNamespace;
  JWT_SECRET: string;
  APP_VERSION?: string;
  ACCESS_TOKEN_EXPIRES_IN?: string;
  REFRESH_TOKEN_EXPIRES_IN?: string;
  APP_COOKIE_PREFIX?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Global error handler (must be first)
app.use("/*", errorHandler);

// CORS middleware
app.use(
  "/*",
  cors({
    origin: "*",
    credentials: true,
  }),
);

// Health check endpoint
app.get("/a/health", (c) => {
  return c.json({
    status: "ok",
    service: "cf-saas-template-api",
    version: c.env.APP_VERSION || "dev",
  });
});

// System status endpoint
app.get("/a/status", async (c) => {
  try {
    const dbResult = await c.env.DB.prepare("SELECT 1 as test").first();

    return c.json({
      status: "operational",
      database: dbResult ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return c.json(
      {
        status: "degraded",
        database: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      500,
    );
  }
});

// Public config endpoint
app.get("/a/config", (c) => {
  return c.json({
    accessTokenExpiresIn: c.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
    refreshTokenExpiresIn: c.env.REFRESH_TOKEN_EXPIRES_IN || "30d",
  });
});

// Mount API routes
app.route("/a/auth", authRoutes);

// Export type for frontend consumption
export type AppType = typeof app;

export default app;
