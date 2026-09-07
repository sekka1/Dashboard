import { expect, test } from "@playwright/test";

test.describe("Authentication", () => {
  test("redirects unauthenticated users to sign-in", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/sign-in/);
  });

  test("sign-up page renders the registration form", async ({ page }) => {
    await page.goto("/sign-up");
    await expect(page.getByRole("heading", { name: /create your partner account/i })).toBeVisible();
  });

  test("sign-in page renders the login form", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
  });
});
