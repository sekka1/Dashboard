export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  BETTER_AUTH_URL: string;
  BETTER_AUTH_SECRET: string;
  /**
   * Optional comma-separated list of additional origins that should be
   * trusted by Better Auth (e.g. a custom domain or a *.workers.dev URL
   * that differs from BETTER_AUTH_URL). Example:
   * "https://example.com,https://foo.workers.dev"
   */
  BETTER_AUTH_TRUSTED_ORIGINS?: string;
}

declare module "cloudflare:test" {
  // Makes the `env` helper exported by `cloudflare:test` aware of the D1
  // migrations binding injected for tests (see vitest.config.ts) alongside
  // the regular worker bindings.
  interface ProvidedEnv extends Env {
    TEST_MIGRATIONS: import("@cloudflare/vitest-pool-workers/config").D1Migration[];
  }
}
