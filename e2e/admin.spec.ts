import { expect, test } from "@playwright/test";

test.describe("Admin portal", () => {
  test("unauthenticated user is redirected away from admin portal", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/sign-in/);
  });
});
