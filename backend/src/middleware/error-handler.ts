import { createMiddleware } from "hono/factory";
import type { Bindings } from "../index.js";

export const errorHandler = createMiddleware<{ Bindings: Bindings }>(
  async (c, next) => {
    try {
      await next();
    } catch (error) {
      console.error("API Error:", error);

      if (error instanceof ValidationError) {
        return c.json(
          {
            error: "Validation Error",
            message: error.message,
            fields: error.fields,
          },
          400,
        );
      }

      if (error instanceof UnauthorizedError) {
        return c.json(
          {
            error: "Unauthorized",
            message: error.message || "Authentication required",
          },
          401,
        );
      }

      if (error instanceof ForbiddenError) {
        return c.json(
          {
            error: "Forbidden",
            message: error.message || "Access denied",
          },
          403,
        );
      }

      if (error instanceof NotFoundError) {
        return c.json(
          {
            error: "Not Found",
            message: error.message || "Resource not found",
          },
          404,
        );
      }

      return c.json(
        {
          error: "Internal Server Error",
          message:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred",
        },
        500,
      );
    }
  },
);

export class ValidationError extends Error {
  fields?: Record<string, string>;

  constructor(message: string, fields?: Record<string, string>) {
    super(message);
    this.name = "ValidationError";
    this.fields = fields;
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = "Authentication required") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message: string = "Access denied") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends Error {
  constructor(message: string = "Resource not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export async function validateBody<T>(
  c: import("hono").Context,
  schema: { parse: (data: unknown) => T },
): Promise<T> {
  try {
    const body = await c.req.json();
    return schema.parse(body);
  } catch (error) {
    if (error && typeof error === "object" && "issues" in error) {
      const issues = error.issues as Array<{ path: string[]; message: string }>;
      const fields: Record<string, string> = {};
      issues.forEach((issue) => {
        fields[issue.path.join(".")] = issue.message;
      });
      throw new ValidationError("Invalid request body", fields);
    }
    throw new ValidationError("Invalid request body");
  }
}
