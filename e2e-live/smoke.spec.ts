import { expect, test } from "@playwright/test";

// Smoke tests that run against the live, deployed site (see
// `playwright.live.config.ts`). These are executed post-deployment (e.g. by
// the CD workflow after a merge to `main`) to make sure the production
// deployment is actually reachable and that a real user can sign in.
//
// The test user's credentials come from environment variables so they are
// never hardcoded in source. `E2E_TEST_EMAIL` defaults to the `partner` user
// seeded by `scripts/seed-users.mjs` / `drizzle/seed/seed.sql`, but
// `E2E_TEST_PASSWORD` must always be supplied explicitly (e.g. via a GitHub
// Actions secret) - the sign-in test is skipped if it isn't set.
const TEST_EMAIL = process.env.E2E_TEST_EMAIL ?? "partner@example.com";
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD;

test.describe("Live deployment smoke tests", () => {
  test("main page loads and redirects to sign-in when signed out", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.ok()).toBeTruthy();
    await expect(page).toHaveURL(/sign-in/);
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
  });

  test("test user can sign in and reach the dashboard", async ({ page }) => {
    test.skip(!TEST_PASSWORD, "E2E_TEST_PASSWORD must be set to run the sign-in smoke test");

    await page.goto("/sign-in");

    await page.getByPlaceholder("Email").fill(TEST_EMAIL);
    await page.getByPlaceholder("Password").fill(TEST_PASSWORD!);
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByRole("heading", { name: /partner dashboard/i })).toBeVisible();
  });
});
