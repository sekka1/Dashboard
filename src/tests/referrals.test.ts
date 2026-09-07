import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

describe("API authentication", () => {
  it("rejects unauthenticated requests to /api/referrals", async () => {
    const res = await SELF.fetch("https://example.com/api/referrals");
    expect(res.status).toBe(401);
  });

  it("rejects unauthenticated requests to /api/admin/users", async () => {
    const res = await SELF.fetch("https://example.com/api/admin/users");
    expect(res.status).toBe(401);
  });

  it("allows signing up and signing in without a schema error", async () => {
    const email = "schema-check@example.com";
    const password = "super-secret-password";

    const signUpRes = await SELF.fetch(
      "https://example.com/api/auth/sign-up/email",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password, name: "Schema Check" }),
      },
    );
    expect(signUpRes.status).toBe(200);

    const signInRes = await SELF.fetch(
      "https://example.com/api/auth/sign-in/email",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      },
    );
    expect(signInRes.status).toBe(200);
  });
});
