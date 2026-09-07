import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "../db";
import { users, sessions, accounts, verifications } from "../db/schema";
import type { Env } from "./env";

export function createAuth(env: Env) {
  const db = getDb(env.DB);
  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: {
        user: users,
        session: sessions,
        account: accounts,
        verification: verifications,
      },
    }),
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    emailAndPassword: {
      enabled: true,
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          defaultValue: "partner",
          input: false,
        },
        status: {
          type: "string",
          defaultValue: "pending",
          input: false,
        },
      },
    },
    trustedOrigins: getTrustedOrigins(env),
  });
}

/**
 * Builds the list of origins Better Auth should trust when validating
 * sign-in/sign-up requests. Always includes the configured BETTER_AUTH_URL
 * plus common local development origins so `npm run dev` (Vite on 5173)
 * and `wrangler dev` (8787) keep working, and allows extra production
 * origins (e.g. a *.workers.dev URL) to be supplied via
 * BETTER_AUTH_TRUSTED_ORIGINS without requiring a code change.
 */
export function getTrustedOrigins(env: Env): string[] {
  const extraOrigins = (env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return Array.from(
    new Set(
      [
        env.BETTER_AUTH_URL,
        "http://localhost:5173",
        "http://localhost:8787",
        ...extraOrigins,
      ].filter(Boolean),
    ),
  );
}

export type Auth = ReturnType<typeof createAuth>;
