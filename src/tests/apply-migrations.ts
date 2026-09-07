import { applyD1Migrations, env } from "cloudflare:test";

// Applies the Drizzle-generated D1 migrations to the test database binding
// before any tests run, so tests exercise the real schema (e.g. the "users"
// table) instead of hitting "no such table" errors.
await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
