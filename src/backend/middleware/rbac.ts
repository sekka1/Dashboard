import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { createAuth } from "../auth";
import type { Env } from "../env";
import type { User } from "../../db/schema";

export type AppVariables = {
  user: User;
};

/**
 * Verifies the Better Auth session cookie/token and attaches the
 * authenticated user (with role/status) to the request context.
 * Rejects requests from users whose account is not 'active'.
 */
export const requireAuth = createMiddleware<{
  Bindings: Env;
  Variables: AppVariables;
}>(async (c, next) => {
  const auth = createAuth(c.env);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session?.user) {
    throw new HTTPException(401, { message: "Authentication required" });
  }

  const user = session.user as unknown as User;

  if (user.status !== "active") {
    throw new HTTPException(403, {
      message: "Your account is pending administrator approval.",
    });
  }

  c.set("user", user);
  await next();
});

/** Restricts access to users with the 'admin' role. Must run after requireAuth. */
export const requireAdmin = createMiddleware<{
  Bindings: Env;
  Variables: AppVariables;
}>(async (c, next) => {
  const user = c.get("user");
  if (user.role !== "admin") {
    throw new HTTPException(403, { message: "Admin access required" });
  }
  await next();
});
