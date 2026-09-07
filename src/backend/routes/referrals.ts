import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "../../db";
import { referrals } from "../../db/schema";
import { requireAuth, type AppVariables } from "../middleware/rbac";
import type { Env } from "../env";

const createReferralSchema = z.object({
  clientName: z.string().min(1).max(200),
  clientEmail: z.string().email().optional().or(z.literal("")),
  clientPhone: z.string().max(30).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

const updateReferralSchema = z.object({
  status: z
    .enum(["submitted", "contacted", "in_progress", "closed_won", "closed_lost"])
    .optional(),
  dealValueCents: z.number().int().nonnegative().optional(),
  estimatedCommissionCents: z.number().int().nonnegative().optional(),
});

export const referralsRoute = new Hono<{ Bindings: Env; Variables: AppVariables }>()
  .use("*", requireAuth)
  // List referrals: partners see only their own, admins see all.
  .get("/", async (c) => {
    const db = getDb(c.env.DB);
    const user = c.get("user");
    const rows =
      user.role === "admin"
        ? await db.select().from(referrals)
        : await db.select().from(referrals).where(eq(referrals.partnerId, user.id));
    return c.json({ referrals: rows });
  })
  // Create a referral, always scoped to the authenticated partner.
  .post("/", zValidator("json", createReferralSchema), async (c) => {
    const db = getDb(c.env.DB);
    const user = c.get("user");
    const body = c.req.valid("json");
    const referral = {
      id: crypto.randomUUID(),
      partnerId: user.id,
      clientName: body.clientName,
      clientEmail: body.clientEmail || null,
      clientPhone: body.clientPhone || null,
      notes: body.notes || null,
      status: "submitted" as const,
    };
    await db.insert(referrals).values(referral);
    return c.json({ referral }, 201);
  })
  // Update a referral: partners may only touch their own; only admins may set
  // status transitions, deal value, and commission.
  .patch("/:id", zValidator("json", updateReferralSchema), async (c) => {
    const db = getDb(c.env.DB);
    const user = c.get("user");
    const id = c.req.param("id");
    const body = c.req.valid("json");

    const [existing] = await db.select().from(referrals).where(eq(referrals.id, id));
    if (!existing) {
      return c.json({ error: "Referral not found" }, 404);
    }

    const isOwner = existing.partnerId === user.id;
    if (!isOwner && user.role !== "admin") {
      return c.json({ error: "Forbidden" }, 403);
    }
    if (user.role !== "admin" && (body.status || body.dealValueCents !== undefined || body.estimatedCommissionCents !== undefined)) {
      return c.json({ error: "Only admins may update referral status or financials" }, 403);
    }

    await db
      .update(referrals)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(referrals.id, id));

    const [updated] = await db.select().from(referrals).where(eq(referrals.id, id));
    return c.json({ referral: updated });
  });
