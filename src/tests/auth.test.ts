import { describe, expect, it } from "vitest";
import { getTrustedOrigins } from "../backend/auth";
import type { Env } from "../backend/env";

function makeEnv(overrides: Partial<Env> = {}): Env {
  return {
    DB: {} as Env["DB"],
    ASSETS: {} as Env["ASSETS"],
    BETTER_AUTH_URL: "http://localhost:8787",
    BETTER_AUTH_SECRET: "secret",
    ...overrides,
  };
}

describe("getTrustedOrigins", () => {
  it("always trusts the configured BETTER_AUTH_URL and local dev origins", () => {
    const origins = getTrustedOrigins(
      makeEnv({ BETTER_AUTH_URL: "https://example.workers.dev" }),
    );

    expect(origins).toContain("https://example.workers.dev");
    expect(origins).toContain("http://localhost:5173");
    expect(origins).toContain("http://localhost:8787");
  });

  it("includes additional origins from BETTER_AUTH_TRUSTED_ORIGINS", () => {
    const origins = getTrustedOrigins(
      makeEnv({
        BETTER_AUTH_URL: "https://example.workers.dev",
        BETTER_AUTH_TRUSTED_ORIGINS:
          "https://custom-domain.com, https://another.workers.dev",
      }),
    );

    expect(origins).toContain("https://custom-domain.com");
    expect(origins).toContain("https://another.workers.dev");
  });

  it("does not produce duplicate entries", () => {
    const origins = getTrustedOrigins(
      makeEnv({
        BETTER_AUTH_URL: "http://localhost:8787",
        BETTER_AUTH_TRUSTED_ORIGINS: "http://localhost:8787",
      }),
    );

    expect(origins.filter((o) => o === "http://localhost:8787")).toHaveLength(
      1,
    );
  });
});
