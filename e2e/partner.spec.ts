import { expect, test } from "@playwright/test";

test.describe("Partner dashboard", () => {
  test("unauthenticated partner is redirected away from dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/sign-in/);
  });
});
