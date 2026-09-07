import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "../../db";
import { users } from "../../db/schema";
import { requireAuth, requireAdmin, type AppVariables } from "../middleware/rbac";
import type { Env } from "../env";

const updateUserSchema = z.object({
  role: z.enum(["admin", "partner"]).optional(),
  status: z.enum(["active", "pending", "deactivated"]).optional(),
});

export const adminUsersRoute = new Hono<{ Bindings: Env; Variables: AppVariables }>()
  .use("*", requireAuth, requireAdmin)
  .get("/", async (c) => {
    const db = getDb(c.env.DB);
    const rows = await db.select().from(users);
    return c.json({ users: rows });
  })
  .patch("/:id", zValidator("json", updateUserSchema), async (c) => {
    const db = getDb(c.env.DB);
    const id = c.req.param("id");
    const body = c.req.valid("json");

    const [existing] = await db.select().from(users).where(eq(users.id, id));
    if (!existing) {
      return c.json({ error: "User not found" }, 404);
    }

    await db
      .update(users)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(users.id, id));

    const [updated] = await db.select().from(users).where(eq(users.id, id));
    return c.json({ user: updated });
  });
