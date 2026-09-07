import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { createAuth } from "./auth";
import { adminUsersRoute } from "./routes/admin-users";
import { dataIngestRoute, sensorsRoute } from "./routes/sensors";
import type { Env } from "./env";
import type { AppVariables } from "./middleware/rbac";

const app = new Hono<{ Bindings: Env; Variables: AppVariables }>()
  .use("*", secureHeaders())
  .use(
    "/api/*",
    cors({
      origin: (_origin, c) => c.env.BETTER_AUTH_URL,
      credentials: true,
    }),
  )
  .on(["GET", "POST"], "/api/auth/*", (c) => {
    const auth = createAuth(c.env);
    return auth.handler(c.req.raw);
  })
  // Public sensor ingestion endpoint: authenticated via SENSOR_API_TOKEN
  // instead of a user session, so it is intentionally outside /api/*.
  .route("/data", dataIngestRoute)
  .route("/api/sensors", sensorsRoute)
  .route("/api/admin/users", adminUsersRoute)
  // SPA fallback: any non-API route is served by the static assets binding,
  // which handles single-page-application routing per wrangler.jsonc config.
  // The response is rewrapped since asset responses have immutable headers.
  .get("*", async (c) => {
    const assetResponse = await c.env.ASSETS.fetch(c.req.raw);
    return new Response(assetResponse.body, assetResponse);
  });

export default app;
export type AppType = typeof app;
